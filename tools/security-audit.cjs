#!/usr/bin/env node
/*
 * Static security-audit scanner for the Pyet Doktorin codebase.
 *
 * A dependency-free, repeatable "audit system" that greps the tracked source
 * for insecure patterns across the OWASP-relevant surfaces this app exposes:
 * XSS sinks, secret leakage, CORS/CSP misconfiguration, insecure external
 * links, weak crypto/randomness, and dangerous dynamic execution.
 *
 * Usage:
 *   node tools/security-audit.cjs            # human-readable report (all tracked files)
 *   node tools/security-audit.cjs --json     # machine-readable JSON
 *   node tools/security-audit.cjs --report SECURITY_AUDIT_SCAN.md
 *   node tools/security-audit.cjs --strict   # exit 1 on medium findings too
 *   node tools/security-audit.cjs --staged   # scan only git-staged files (pre-commit gate)
 *   node tools/security-audit.cjs --watch     # re-run on every source change (live agent)
 *
 * Exit codes: 0 = clean (or only informational), 1 = high findings present
 * (or medium+ when --strict). Designed to run in CI, a pre-commit hook, or a
 * live watcher — a repeatable "security engineer inside the repo".
 */
'use strict';

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();
const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const STRICT = args.includes('--strict');
const STAGED = args.includes('--staged');
const WATCH = args.includes('--watch');
const reportIdx = args.indexOf('--report');
const REPORT_PATH = reportIdx !== -1 ? args[reportIdx + 1] : null;

const SEVERITY = { HIGH: 'high', MEDIUM: 'medium', LOW: 'low', INFO: 'info' };
const SEVERITY_RANK = { high: 3, medium: 2, low: 1, info: 0 };

// Files this scanner is allowed to flag itself in are excluded so the
// pattern strings below don't produce self-referential findings.
const SELF = 'tools/security-audit.cjs';

const SCAN_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.cjs', '.mjs', '.json', '.yml', '.yaml', '.env.example',
]);

/**
 * Each rule inspects a single line. `test` returns true when the line is a
 * finding. `skip` (optional) lets a rule ignore known-safe files.
 */
const RULES = [
  {
    id: 'xss-dangerous-html',
    severity: SEVERITY.HIGH,
    title: 'React dangerouslySetInnerHTML sink',
    advice: 'Avoid dangerouslySetInnerHTML. If unavoidable, sanitize with a vetted sanitizer (e.g. DOMPurify) before rendering.',
    test: (line) => /dangerouslySetInnerHTML/.test(line),
  },
  {
    id: 'dynamic-eval',
    severity: SEVERITY.HIGH,
    title: 'Dynamic code execution (eval / new Function)',
    advice: 'Remove eval()/new Function(). They enable code injection and defeat CSP.',
    test: (line) => /(^|[^.\w])eval\s*\(/.test(line) || /new\s+Function\s*\(/.test(line),
  },
  {
    id: 'raw-innerhtml',
    severity: SEVERITY.MEDIUM,
    title: 'Raw DOM HTML sink (innerHTML / document.write)',
    advice: 'Use textContent or framework rendering instead of assigning innerHTML / document.write with untrusted data.',
    test: (line) => /\.innerHTML\s*=/.test(line) || /document\.write\s*\(/.test(line),
  },
  {
    id: 'committed-private-key',
    severity: SEVERITY.HIGH,
    title: 'Committed private key material',
    advice: 'Remove the key, rotate it immediately, and load it from a secret manager / env var instead.',
    test: (line) => /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/.test(line),
    skip: (file) => file.endsWith('.env.example'),
  },
  {
    id: 'committed-cloud-secret',
    severity: SEVERITY.HIGH,
    title: 'Committed cloud / payment secret',
    advice: 'Never commit live credentials. Rotate the exposed secret and move it to environment configuration.',
    test: (line) =>
      /AKIA[0-9A-Z]{16}/.test(line) ||
      /sk_live_[0-9a-zA-Z]{10,}/.test(line) ||
      /AIza[0-9A-Za-z_\-]{35}/.test(line),
    skip: (file) => file.endsWith('.env.example'),
  },
  {
    id: 'public-env-secret',
    severity: SEVERITY.HIGH,
    title: 'Secret exposed through a client-visible NEXT_PUBLIC_ variable',
    advice: 'NEXT_PUBLIC_* values ship to the browser. Never place service-account, private, or secret material behind that prefix.',
    test: (line) => /NEXT_PUBLIC_[A-Z0-9_]*(SECRET|PRIVATE|SERVICE_ACCOUNT|PASSWORD)/.test(line),
  },
  {
    id: 'cors-wildcard-credentials',
    severity: SEVERITY.HIGH,
    title: 'CORS wildcard origin combined with credentials',
    advice: 'Reflecting "*" with credentials is invalid and unsafe. Allow-list explicit origins when credentials are enabled.',
    test: (line) => /Access-Control-Allow-Origin['"\s:]*\*/.test(line),
  },
  {
    id: 'cors-reflect-any-origin',
    severity: SEVERITY.MEDIUM,
    title: 'CORS callback appears to reflect any origin',
    advice: 'Ensure the CORS origin callback validates against an allow-list rather than unconditionally echoing the request origin.',
    test: (line) => /origin:\s*true\b/.test(line) && /credentials/.test(line),
  },
  {
    id: 'insecure-external-link',
    severity: SEVERITY.LOW,
    title: 'target="_blank" without rel="noopener"',
    advice: 'Add rel="noopener" (or noopener noreferrer) to prevent reverse-tabnabbing.',
    // `rel` is often on an adjacent JSX line, so check a small window.
    contextTest: (line, lines, idx) => {
      if (!/target=["']_blank["']/.test(line)) return false;
      const window = lines.slice(Math.max(0, idx - 3), idx + 4).join(' ');
      return !/noopener/.test(window);
    },
  },
  {
    id: 'weak-random-token',
    severity: SEVERITY.MEDIUM,
    title: 'Math.random() used for a security-sensitive value',
    advice: 'Math.random() is not cryptographically secure. Use crypto.randomUUID() / crypto.getRandomValues() for tokens, nonces, secrets, or session identifiers.',
    test: (line) =>
      /Math\.random\(\)/.test(line) &&
      /(token|secret|nonce|otp|password|session|csrf|api[_-]?key)/i.test(line),
  },
  {
    id: 'tls-verification-disabled',
    severity: SEVERITY.HIGH,
    title: 'TLS certificate verification disabled',
    advice: 'Never disable TLS verification. Remove rejectUnauthorized:false / NODE_TLS_REJECT_UNAUTHORIZED=0.',
    test: (line) =>
      /rejectUnauthorized\s*:\s*false/.test(line) ||
      /NODE_TLS_REJECT_UNAUTHORIZED\s*=\s*['"]?0/.test(line),
  },
  {
    id: 'http-url-literal',
    severity: SEVERITY.LOW,
    title: 'Plaintext http:// URL literal in source',
    advice: 'Prefer https:// for any network endpoint. localhost is acceptable for local development only.',
    test: (line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('#')) return false;
      return (
        /['"`]http:\/\//.test(line) &&
        !/http:\/\/localhost/.test(line) &&
        !/http:\/\/127\.0\.0\.1/.test(line) &&
        !/schema|xmlns|w3\.org|example\.com/.test(line)
      );
    },
  },
];

function listTrackedFiles() {
  const out = execSync('git ls-files', { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  return out.split('\n').map((f) => f.trim()).filter(Boolean);
}

function listStagedFiles() {
  const out = execSync('git diff --cached --name-only --diff-filter=ACM', {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split('\n').map((f) => f.trim()).filter(Boolean);
}

function shouldScan(file) {
  if (file === SELF) return false;
  if (file.includes('node_modules/')) return false;
  if (file.endsWith('.env.example')) return true;
  return SCAN_EXTENSIONS.has(path.extname(file));
}

function scanFile(file, findings) {
  let contents;
  try {
    contents = fs.readFileSync(path.join(ROOT, file), 'utf8');
  } catch {
    return;
  }
  const lines = contents.split('\n');
  lines.forEach((line, i) => {
    for (const rule of RULES) {
      if (rule.skip && rule.skip(file)) continue;
      const hit = rule.contextTest ? rule.contextTest(line, lines, i) : rule.test(line);
      if (hit) {
        findings.push({
          rule: rule.id,
          severity: rule.severity,
          title: rule.title,
          advice: rule.advice,
          file,
          line: i + 1,
          snippet: line.trim().slice(0, 200),
        });
      }
    }
  });
}

function runScan() {
  const source = STAGED ? listStagedFiles() : listTrackedFiles();
  const files = source.filter(shouldScan);
  const findings = [];
  for (const file of files) scanFile(file, findings);

  findings.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

  const counts = { high: 0, medium: 0, low: 0, info: 0 };
  for (const f of findings) counts[f.severity] += 1;

  if (JSON_OUT) {
    process.stdout.write(JSON.stringify({ scannedFiles: files.length, counts, findings }, null, 2) + '\n');
  } else {
    printHuman(files.length, counts, findings);
  }

  if (REPORT_PATH) {
    fs.writeFileSync(path.join(ROOT, REPORT_PATH), buildMarkdown(files.length, counts, findings));
    if (!JSON_OUT) process.stdout.write(`\nReport written to ${REPORT_PATH}\n`);
  }

  const failsHigh = counts.high > 0;
  const failsStrict = STRICT && (counts.high > 0 || counts.medium > 0);
  return failsHigh || failsStrict ? 1 : 0;
}

// Live mode: keep auditing as you work. Debounced so a burst of saves triggers
// one scan. Ctrl-C to stop. Never exits non-zero (it's an assistant, not a gate).
function watch() {
  let timer = null;
  const rescan = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (process.stdout.isTTY) process.stdout.write('\x1b[2J\x1b[H');
      process.stdout.write(`[security-audit watch] ${new Date().toLocaleTimeString()}\n`);
      try {
        runScan();
      } catch (err) {
        process.stderr.write(`watch scan failed: ${err && err.message}\n`);
      }
    }, 300);
  };

  const watchTargets = ['src', 'backend/src', 'middleware.ts', 'next.config.js', 'server.js', 'firestore.rules'];
  for (const target of watchTargets) {
    const abs = path.join(ROOT, target);
    if (!fs.existsSync(abs)) continue;
    try {
      fs.watch(abs, { recursive: true }, rescan);
    } catch {
      // recursive watch is unsupported on some platforms; ignore that target
    }
  }
  process.stdout.write('[security-audit] watching for changes — press Ctrl-C to stop\n');
  rescan();
}

function main() {
  if (WATCH) {
    watch();
    return;
  }
  process.exit(runScan());
}

function color(sev, text) {
  if (!process.stdout.isTTY) return text;
  const codes = { high: 31, medium: 33, low: 36, info: 90 };
  return `\x1b[${codes[sev] || 0}m${text}\x1b[0m`;
}

function printHuman(fileCount, counts, findings) {
  const scope = STAGED ? 'staged' : 'tracked';
  process.stdout.write(`\nPyet Doktorin security audit — scanned ${fileCount} ${scope} files\n`);
  process.stdout.write(
    `Findings: ${counts.high} high, ${counts.medium} medium, ${counts.low} low\n\n`,
  );
  if (findings.length === 0) {
    process.stdout.write('No pattern-based findings. ✓\n');
    return;
  }
  for (const f of findings) {
    process.stdout.write(`${color(f.severity, `[${f.severity.toUpperCase()}]`)} ${f.title} (${f.rule})\n`);
    process.stdout.write(`  ${f.file}:${f.line}\n`);
    process.stdout.write(`  > ${f.snippet}\n`);
    process.stdout.write(`  fix: ${f.advice}\n\n`);
  }
}

function buildMarkdown(fileCount, counts, findings) {
  const lines = [];
  lines.push('# Security Audit Scan Results');
  lines.push('');
  lines.push(`Generated by \`tools/security-audit.cjs\` — scanned ${fileCount} tracked files.`);
  lines.push('');
  lines.push(`**Findings:** ${counts.high} high · ${counts.medium} medium · ${counts.low} low`);
  lines.push('');
  if (findings.length === 0) {
    lines.push('No pattern-based findings.');
    return lines.join('\n') + '\n';
  }
  lines.push('| Severity | Rule | Location | Detail |');
  lines.push('| --- | --- | --- | --- |');
  for (const f of findings) {
    lines.push(`| ${f.severity} | ${f.rule} | \`${f.file}:${f.line}\` | ${f.title} |`);
  }
  return lines.join('\n') + '\n';
}

main();

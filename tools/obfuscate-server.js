#!/usr/bin/env node
// Obfuscate compiled server-side Next.js chunks using js-confuser.
// Targets:
// - .next/server/app/api/**/*.js (App Router API routes)
// - .next/server/pages/api/**/*.js (Pages Router API routes, if present)
// - .next/server/app/admin/**/*.js (Admin SSR chunks)
//
// Run after `next build`.
const fs = require('node:fs');
const path = require('node:path');

// Support both CommonJS and ESM export shapes from js-confuser v2
const jsConfuserMod = require('js-confuser');
const runObfuscate = jsConfuserMod.obfuscate || jsConfuserMod.default || jsConfuserMod;

const projectRoot = path.resolve(__dirname, '..');
const nextServerDir = path.join(projectRoot, '.next', 'server');

const targets = [
  path.join(nextServerDir, 'app', 'api'),
  path.join(nextServerDir, 'pages', 'api'),
  path.join(nextServerDir, 'app', 'admin'),
];

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else if (entry.isFile() && full.endsWith('.js')) {
      yield full;
    }
  }
}

async function obfuscateFile(file) {
  const src = fs.readFileSync(file, 'utf8');
  const output = await runObfuscate(src, {
    target: 'node',
    preset: 'medium',
    stringEncoding: false,
  });
  const code = typeof output === 'string' ? output : output.code || output;
  fs.writeFileSync(file, code, 'utf8');
  console.log(`Obfuscated: ${path.relative(projectRoot, file)}`);
}

async function main() {
  let count = 0;
  for (const dir of targets) {
    for (const file of walk(dir)) {
      await obfuscateFile(file);
      count++;
    }
  }
  console.log(`Obfuscation complete. Files processed: ${count}`);
}

main().catch((err) => {
  console.error('Obfuscation failed:', err);
  process.exit(1);
});
const fs = require("fs");
const path = require("path");

function indexToLineCol(text, index) {
  let line = 1;
  let lastNewline = -1;
  for (let i = 0; i < index && i < text.length; i += 1) {
    if (text.charCodeAt(i) === 10) {
      line += 1;
      lastNewline = i;
    }
  }
  const col = index - lastNewline;
  return { line, col };
}

function extractPosition(message) {
  const match = message.match(/position\s+(\d+)/i);
  if (!match) return null;
  const pos = Number(match[1]);
  return Number.isFinite(pos) ? pos : null;
}

function codeFrame(text, line, col) {
  const lines = text.split("\n");
  const start = Math.max(1, line - 2);
  const end = Math.min(lines.length, line + 2);
  const width = String(end).length;
  let out = "";
  for (let i = start; i <= end; i += 1) {
    const prefix = String(i).padStart(width, " ") + " | ";
    out += prefix + lines[i - 1] + "\n";
    if (i === line) {
      out += " ".repeat(prefix.length + Math.max(0, col - 1)) + "^\n";
    }
  }
  return out.trimEnd();
}

function validateJsonFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  try {
    JSON.parse(text);
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const pos = extractPosition(message);
    const location = pos == null ? null : indexToLineCol(text, pos);
    return { ok: false, message, pos, location, text };
  }
}

function main() {
  const localesDir = `${process.cwd()}/src/locales`;
  const files = fs
    .readdirSync(localesDir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      if (f.includes("/") || f.includes("\\")) {
        throw new Error(`Unexpected locale filename: ${f}`);
      }
      return localesDir + path.sep + f;
    })
    .sort();

  if (files.length === 0) {
    console.log("No locale JSON files found in", localesDir);
    return;
  }

  let failed = false;
  for (const filePath of files) {
    const result = validateJsonFile(filePath);
    if (result.ok) {
      console.log("OK", path.relative(process.cwd(), filePath));
      continue;
    }
    failed = true;
    const rel = path.relative(process.cwd(), filePath);
    console.error("\nInvalid JSON:", rel);
    console.error(result.message);
    if (result.location) {
      console.error(`at line ${result.location.line}, col ${result.location.col}`);
      console.error(codeFrame(result.text, result.location.line, result.location.col));
    }
  }

  if (failed) process.exit(1);
}

main();

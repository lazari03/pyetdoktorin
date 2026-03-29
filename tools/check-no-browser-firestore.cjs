const fs = require("node:fs");
const path = require("node:path");

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const allowedPrefixes = [
  path.join("src", "app", "api") + path.sep,
];
const allowedSuffixes = [
  "Server.ts",
  "Server.tsx",
  ".server.ts",
  ".server.tsx",
];
const disallowedPatterns = [
  /\bfrom\s+['"]firebase\/firestore['"]/,
  /\bimport\s*\(\s*['"]firebase\/firestore['"]\s*\)/,
];

function isAllowed(relativePath) {
  return (
    allowedPrefixes.some((prefix) => relativePath.startsWith(prefix)) ||
    allowedSuffixes.some((suffix) => relativePath.endsWith(suffix))
  );
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry.name) || /\.d\.ts$/.test(entry.name)) {
      continue;
    }
    files.push(fullPath);
  }
  return files;
}

const failures = [];

for (const filePath of walk(srcDir)) {
  const relativePath = path.relative(rootDir, filePath);
  if (isAllowed(relativePath)) {
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    if (disallowedPatterns.some((pattern) => pattern.test(lines[index]))) {
      failures.push(`${relativePath}:${index + 1}: ${lines[index].trim()}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Forbidden firebase/firestore import found in browser-executed frontend code:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("No forbidden browser Firestore imports found.");

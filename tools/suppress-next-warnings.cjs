/* eslint-disable no-console */

// Dev-only noise suppression for known, non-actionable warnings emitted by Next.js internals.
// This does NOT affect production builds or runtime.

const SUPPRESSED_PATTERNS = [
  /useLayoutEffect does nothing on the server/i,
];

function isSuppressed(args) {
  for (const arg of args) {
    if (typeof arg !== "string") continue;
    if (SUPPRESSED_PATTERNS.some((re) => re.test(arg))) return true;
  }
  return false;
}

const originalError = console.error.bind(console);
const originalWarn = console.warn.bind(console);

console.error = (...args) => {
  if (isSuppressed(args)) return;
  originalError(...args);
};

console.warn = (...args) => {
  if (isSuppressed(args)) return;
  originalWarn(...args);
};


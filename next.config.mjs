// ...existing config...

/**
 * Custom ESLint configuration helper for "unused imports" checks.
 * This mirrors the command you ran manually:
 *   npx eslint src/app src/components src/domain src/store --ext .ts,.tsx --fix
 */
export const UNUSED_IMPORT_LINT_PATHS = [
  'src/app',
  'src/components',
  'src/domain',
  'src/store',
];

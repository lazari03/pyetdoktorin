export type PasswordStrengthScore = 0 | 1 | 2 | 3 | 4;

export interface PasswordStrengthResult {
  score: PasswordStrengthScore;
  labelKey: 'passwordStrengthWeak' | 'passwordStrengthFair' | 'passwordStrengthGood' | 'passwordStrengthStrong';
}

// ponytail: simple heuristic (length + character variety), not a full entropy
// model like zxcvbn. Good enough for a visual nudge; upgrade if false
// positives on common weak passwords become a real problem.
export function getPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const capped = Math.min(score, 4) as PasswordStrengthScore;
  const labelKey =
    capped <= 1 ? 'passwordStrengthWeak'
    : capped === 2 ? 'passwordStrengthFair'
    : capped === 3 ? 'passwordStrengthGood'
    : 'passwordStrengthStrong';

  return { score: capped, labelKey };
}

// Single source of truth for the doctor terms & conditions text — the frontend
// fetches this at render time instead of keeping its own copy, so there's no
// risk of the signed record disagreeing with what was actually shown.
// Bump DOCTOR_TERMS_VERSION whenever DOCTOR_TERMS_TEXT changes; existing
// signed agreements keep the version they signed under.
export const DOCTOR_TERMS_VERSION = '2026-07-25';

export const DOCTOR_TERMS_TITLE = 'Doctor Terms & Conditions';

export const DOCTOR_TERMS_PARAGRAPHS: string[] = [
  'By signing below, you confirm that you are a licensed medical professional authorized to practice in your jurisdiction and that the credentials provided on your Pyet Doktorin profile are accurate and current.',
  'You agree to provide consultations, advice, and prescriptions through the platform in accordance with applicable medical, professional conduct, and data-protection regulations.',
  'You are responsible for the clinical accuracy and appropriateness of any advice, diagnosis, or prescription you issue through the platform, and for maintaining the confidentiality of patient information in line with applicable privacy law.',
  'You agree not to share your account credentials or signature with any other individual, and to notify the platform promptly if you believe your account or signature has been compromised.',
  'Pyet Doktorin may suspend or terminate your access to the platform if you violate these terms, applicable law, or standards of professional conduct.',
  'This agreement remains in effect until a revised version is issued and re-signed, or until your account is terminated.',
];

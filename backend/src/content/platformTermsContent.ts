// Single source of truth for the general platform terms shown to every new
// user (any role) at registration — distinct from the doctor-specific signed
// agreement in doctorTermsContent.ts. Bump the version whenever the text
// changes; a mismatched version sent at registration is rejected so a stale
// page can't submit an acceptance of outdated terms.
export const PLATFORM_TERMS_VERSION = '2026-07-25';

export const PLATFORM_TERMS_TITLE = 'Terms & Conditions';

export const PLATFORM_TERMS_PARAGRAPHS: string[] = [
  'Pyet Doktorin is a software platform (SaaS) that connects independent, licensed doctors with patients seeking consultations. We do not employ the doctors on the platform and we do not practice medicine.',
  'We do not provide medical services, medical advice, diagnosis, or treatment as a company. Any clinical advice, diagnosis, prescription, or treatment decision made during a consultation is made solely by the doctor you consult, who is independently responsible for it.',
  'Our role is limited to: connecting doctors and patients through the platform, and processing payments for consultations booked through the platform.',
  'We are not a healthcare provider and are not a party to the doctor-patient relationship formed during a consultation. We are not responsible for the medical outcome, accuracy, or quality of advice given by a doctor using the platform.',
  'By creating an account, you acknowledge that you understand the nature of the platform as described above and agree to use it accordingly.',
];

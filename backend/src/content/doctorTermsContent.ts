// Single source of truth for the doctor terms & conditions text — the frontend
// fetches this at render time instead of keeping its own copy, so there's no
// risk of the signed record disagreeing with what was actually shown.
// Bump DOCTOR_TERMS_VERSION whenever the content changes; existing signed
// agreements keep the version they signed under and are prompted to re-sign.
export const DOCTOR_TERMS_VERSION = '2026-07-25.3';

export const DOCTOR_TERMS_TITLE = 'Doctor Platform Agreement';

export interface DoctorTermsSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export const DOCTOR_TERMS_SECTIONS: DoctorTermsSection[] = [
  {
    title: '1. Parties and nature of this agreement',
    paragraphs: [
      'This Agreement is entered into between you (the "Doctor") and Pyet Doktorin (the "Platform") and governs your use of the Platform to offer teleconsultation services to patients.',
      'You provide medical services as an independent contractor, not as an employee, partner, or agent of the Platform. Nothing in this Agreement creates an employment, partnership, or joint-venture relationship. You are solely responsible for your own tax, social security, and professional-insurance obligations arising from income earned through the Platform.',
    ],
  },
  {
    title: '2. Eligibility and credentials',
    paragraphs: [
      'By signing this Agreement, you confirm that you hold a valid, current license to practice medicine in your jurisdiction, that you are in good standing with the relevant medical or professional order, and that all credentials, specializations, and identifying information on your Platform profile are accurate and kept up to date.',
      'You must notify the Platform immediately if your license is suspended, revoked, restricted, or under investigation, or if any information on your profile becomes inaccurate.',
    ],
  },
  {
    title: '3. What the Platform provides',
    paragraphs: [
      'The Platform is a software service (SaaS) that connects you with patients and provides supporting infrastructure. The Platform is not a healthcare provider, does not practice medicine, and does not supervise, direct, or review your clinical decisions.',
    ],
    bullets: [
      'Appointment scheduling and calendar management',
      'Secure video-consultation infrastructure',
      'Payment collection and payout processing',
      'E-prescription generation and signature infrastructure',
      'Patient messaging and notification tools',
    ],
  },
  {
    title: '4. Your professional responsibilities',
    paragraphs: [
      'You bear sole and complete clinical responsibility for every consultation, diagnosis, prescription, and piece of medical advice you provide through the Platform. The Platform has no role in, and assumes no liability for, the clinical substance of your work.',
      'You must comply with all applicable medical, professional-conduct, and data-protection laws, including Albanian Law No. 10107/2009 on healthcare and Law No. 124/2024 on the protection of personal data, as well as any equivalent rules in your own jurisdiction if you practice from outside Albania.',
      'You must maintain patient confidentiality at all times and only access, use, or disclose patient information as strictly necessary to provide care through the Platform.',
    ],
  },
  {
    title: '5. Electronic signature and prescriptions',
    paragraphs: [
      'The signature you register with the Platform is used to authenticate prescriptions, clinical notes, and other documents you issue through the Platform. By registering your signature, you agree that its use on any document generated from your account carries the same legal weight as your handwritten signature.',
      'You must not share your account credentials or signature with any other person. You must notify the Platform immediately if you believe your account or signature has been compromised, so that it can be suspended pending investigation.',
    ],
  },
  {
    title: '6. Fees, payouts, and payment processing',
    paragraphs: [
      'You set your own consultation fee within the limits allowed by the Platform. The Platform acts as merchant of record for patient payments, collecting the full consultation fee from the patient and remitting your payout share to you, retaining the remainder as its service commission.',
      'In the current fee structure, you receive 70% of each consultation fee and the Platform retains 30%. This split reflects the fact that the Platform bears the cost of the technical infrastructure, payment processing, and support that makes the service possible, while you are not charged any fee to register or maintain your profile on the Platform.',
      'If you do not hold a valid NIPT (business registration number) at the time of payout, the Platform will withhold an additional 15% of your payout share, in addition to its standard commission, to cover your personal income-tax obligations on that payment, since the Platform cannot issue you a business-to-business invoice without one. In that case, you must sign a service contract covering each individual payment collected on your behalf, acknowledging that the Platform is collecting and remitting that payment as your agent and withholding the amount described above. If you obtain a NIPT, this additional withholding no longer applies and you are responsible for invoicing and declaring your own income directly.',
      'Payouts are processed on the schedule and to the payment method you configure in your account settings. The Platform may withhold or reverse a payout to recover amounts linked to a refunded, disputed, or fraudulent transaction.',
    ],
  },
  {
    title: '7. Refunds and cancellations',
    paragraphs: [
      'Patients may be entitled to a refund where a consultation could not take place due to a technical failure of the Platform, or where you fail to attend a confirmed appointment without reasonable notice. You agree to cooperate with the Platform in resolving refund requests in good faith.',
    ],
  },
  {
    title: '8. Confidentiality and data protection',
    paragraphs: [
      'You will treat all patient data accessed through the Platform as confidential and process it only for the purpose of providing care, in accordance with applicable data-protection law. You will not export, copy, or retain patient data outside the Platform except as required for your own legal recordkeeping obligations as a licensed medical professional.',
    ],
  },
  {
    title: '9. Acceptable use',
    paragraphs: [
      'You agree not to use the Platform to solicit patients for services outside the Platform, to circumvent the Platform\'s payment system, to misrepresent your credentials, or to engage in conduct that violates professional-ethics rules or applicable law.',
    ],
  },
  {
    title: '10. Suspension and termination',
    paragraphs: [
      'The Platform may suspend or terminate your access, with or without notice where circumstances require it, if you breach this Agreement, applicable law, or professional-conduct standards, or if your license is suspended or revoked.',
      'You may stop using the Platform at any time. Termination does not relieve either party of obligations that, by their nature, survive termination, including confidentiality and outstanding payment settlement.',
    ],
  },
  {
    title: '11. Liability',
    paragraphs: [
      'To the maximum extent permitted by law, the Platform\'s liability to you arising out of this Agreement is limited to the fees actually paid to you through the Platform in the three months preceding the claim. The Platform is not liable for any clinical outcome, as clinical responsibility rests solely with you.',
    ],
  },
  {
    title: '12. Governing law and disputes',
    paragraphs: [
      'This Agreement is governed by the laws of the Republic of Albania. Any dispute arising from this Agreement that cannot be resolved amicably will be submitted to the competent courts of Albania.',
    ],
  },
  {
    title: '13. Changes to this Agreement',
    paragraphs: [
      'The Platform may update this Agreement from time to time to reflect changes in its services, fees, or applicable law. If the terms change, you will be asked to review and re-sign the updated Agreement before continuing to use the Platform. This Agreement remains in effect, as signed, until superseded by a re-signed version or until your account is terminated.',
    ],
  },
];

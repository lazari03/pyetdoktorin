export interface DoctorTermsSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface DoctorTerms {
  version: string;
  title: string;
  sections: DoctorTermsSection[];
}

export interface DoctorAgreementStatus {
  signed: boolean;
  termsVersion?: string;
  signedAt?: number;
  signatureDataUrl?: string;
}

export interface IDoctorAgreementService {
  getTerms(): Promise<DoctorTerms>;
  getMine(): Promise<DoctorAgreementStatus>;
  submit(signatureDataUrl: string): Promise<DoctorAgreementStatus>;
}

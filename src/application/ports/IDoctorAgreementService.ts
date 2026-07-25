export interface DoctorTerms {
  version: string;
  title: string;
  paragraphs: string[];
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

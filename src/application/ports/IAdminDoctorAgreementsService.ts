export interface DoctorAgreementSummary {
  doctorId: string;
  doctorName: string;
  doctorEmail: string;
  termsVersion: string;
  signedAt: number;
}

export interface IAdminDoctorAgreementsService {
  list(): Promise<DoctorAgreementSummary[]>;
  downloadPdf(doctorId: string): Promise<Blob>;
}

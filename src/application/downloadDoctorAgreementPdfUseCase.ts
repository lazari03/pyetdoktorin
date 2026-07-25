import type { IAdminDoctorAgreementsService } from '@/application/ports/IAdminDoctorAgreementsService';

export class DownloadDoctorAgreementPdfUseCase {
  constructor(private adminDoctorAgreementsService: IAdminDoctorAgreementsService) {}

  async execute(doctorId: string): Promise<Blob> {
    return this.adminDoctorAgreementsService.downloadPdf(doctorId);
  }
}

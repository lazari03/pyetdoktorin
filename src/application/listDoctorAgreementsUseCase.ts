import type { DoctorAgreementSummary, IAdminDoctorAgreementsService } from '@/application/ports/IAdminDoctorAgreementsService';

export class ListDoctorAgreementsUseCase {
  constructor(private adminDoctorAgreementsService: IAdminDoctorAgreementsService) {}

  async execute(): Promise<DoctorAgreementSummary[]> {
    return this.adminDoctorAgreementsService.list();
  }
}

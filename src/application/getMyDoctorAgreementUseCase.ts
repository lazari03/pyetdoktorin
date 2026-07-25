import type { DoctorAgreementStatus, IDoctorAgreementService } from '@/application/ports/IDoctorAgreementService';

export class GetMyDoctorAgreementUseCase {
  constructor(private doctorAgreementService: IDoctorAgreementService) {}

  async execute(): Promise<DoctorAgreementStatus> {
    return this.doctorAgreementService.getMine();
  }
}

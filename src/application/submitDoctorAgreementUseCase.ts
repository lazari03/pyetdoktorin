import type { DoctorAgreementStatus, IDoctorAgreementService } from '@/application/ports/IDoctorAgreementService';

export class SubmitDoctorAgreementUseCase {
  constructor(private doctorAgreementService: IDoctorAgreementService) {}

  async execute(signatureDataUrl: string): Promise<DoctorAgreementStatus> {
    return this.doctorAgreementService.submit(signatureDataUrl);
  }
}

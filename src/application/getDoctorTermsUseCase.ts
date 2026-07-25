import type { DoctorTerms, IDoctorAgreementService } from '@/application/ports/IDoctorAgreementService';

export class GetDoctorTermsUseCase {
  constructor(private doctorAgreementService: IDoctorAgreementService) {}

  async execute(): Promise<DoctorTerms> {
    return this.doctorAgreementService.getTerms();
  }
}

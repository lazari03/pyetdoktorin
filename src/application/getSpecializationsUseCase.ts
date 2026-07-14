import { IDoctorSearchService } from '@/application/ports/IDoctorSearchService';

export class GetSpecializationsUseCase {
  constructor(private doctorSearchService: IDoctorSearchService) {}

  async execute(): Promise<string[]> {
    return this.doctorSearchService.getSpecializations();
  }
}

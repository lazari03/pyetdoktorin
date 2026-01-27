import { IAdminStatsService } from '@/application/ports/IAdminStatsService';

export class GetTopDoctorsByRequestsUseCase {
  constructor(private adminStatsService: IAdminStatsService) {}

  async execute(limit = 5) {
    return this.adminStatsService.getTopDoctorsByRequests(limit);
  }
}

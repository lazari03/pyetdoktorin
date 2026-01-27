import { IAdminStatsService } from '@/application/ports/IAdminStatsService';

export class GetTopDoctorsByAppointmentsUseCase {
  constructor(private adminStatsService: IAdminStatsService) {}

  async execute(limit = 5) {
    return this.adminStatsService.getTopDoctorsByAppointments(limit);
  }
}

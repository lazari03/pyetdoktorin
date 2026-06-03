import type { IAdminStatsService, AdminDashboardStats } from './ports/IAdminStatsService';

export class GetAdminDashboardStatsUseCase {
  constructor(private service: IAdminStatsService) {}
  async execute(): Promise<AdminDashboardStats> {
    return this.service.getDashboardStats();
  }
}

import { IAdminStatsService } from '@/application/ports/IAdminStatsService';
import { fetchTopDoctors } from '@/network/stats';
import { fetchAdminDashboardStats } from '@/network/adminStats';

export class AdminStatsServiceAdapter implements IAdminStatsService {
  async getTopDoctorsByAppointments(limit = 5) {
    const response = await fetchTopDoctors('appointments', limit);
    return response.items;
  }

  async getTopDoctorsByRequests(limit = 5) {
    const response = await fetchTopDoctors('requests', limit);
    return response.items;
  }

  async getDashboardStats() {
    return fetchAdminDashboardStats();
  }
}

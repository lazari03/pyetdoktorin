import { IAdminStatsService } from '@/application/ports/IAdminStatsService';
import { getTopDoctorsByAppointments, getTopDoctorsByRequests } from '@/infrastructure/queries/appointments';

export class AdminStatsServiceAdapter implements IAdminStatsService {
  async getTopDoctorsByAppointments(limit = 5) {
    return getTopDoctorsByAppointments(limit);
  }

  async getTopDoctorsByRequests(limit = 5) {
    return getTopDoctorsByRequests(limit);
  }
}

import type { User } from '@/domain/entities/User';

export interface IAdminStatsService {
  getTopDoctorsByAppointments(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
  getTopDoctorsByRequests(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
}

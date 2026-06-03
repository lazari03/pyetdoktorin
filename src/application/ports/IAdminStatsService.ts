import type { User } from '@/domain/entities/User';

export interface AdminDashboardStats {
  totalAppointments: number;
  totalRecipes: number;
  totalClinicBookings: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export interface IAdminStatsService {
  getTopDoctorsByAppointments(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
  getTopDoctorsByRequests(limit?: number): Promise<Array<{ doctor: User; count: number }>>;
  getDashboardStats(): Promise<AdminDashboardStats>;
}

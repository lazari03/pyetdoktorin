import { backendFetch } from './backendClient';

export interface AdminDashboardStats {
  totalAppointments: number;
  totalRecipes: number;
  totalClinicBookings: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export async function fetchAdminDashboardStats() {
  return backendFetch<AdminDashboardStats>('/api/stats/admin');
}

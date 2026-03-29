import type { User } from '@/domain/entities/User';
import { IAdminUserService, AdminUsersPage } from '@/application/ports/IAdminUserService';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUser,
  fetchAdminUsers,
  resetAdminUserPassword,
  updateAdminUser,
} from '@/network/adminUsers';

export class AdminUserService implements IAdminUserService {
  async getAllUsers(): Promise<User[]> {
    const response = await fetchAdminUsers({ page: 0, pageSize: 500 });
    return response.items as User[];
  }

  async getUsersPage(page: number, pageSize: number): Promise<AdminUsersPage> {
    const response = await fetchAdminUsers({ page, pageSize });
    return {
      items: response.items as User[],
      total: response.total,
      page: response.page,
      pageSize: response.pageSize,
    };
  }

  async getUserById(id: string): Promise<User | null> {
    return (await fetchAdminUser(id)) as User | null;
  }

  async getDoctorProfile(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null> {
    return (await fetchAdminUser(id)) as (User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null;
  }

  async resetUserPassword(id: string): Promise<{ resetLink?: string }> {
    return resetAdminUserPassword(id);
  }

  async deleteUserAccount(id: string): Promise<void> {
    await deleteAdminUser(id);
  }

  async createAdminUser(payload: { name: string; surname: string; email: string; password: string; role: User['role']; phone?: string }): Promise<User> {
    const created = await createAdminUser(payload);
    return { id: created.id, email: payload.email, role: payload.role } as User;
  }

  async updateUserAdmin(id: string, payload: { name?: string; surname?: string; role?: User['role']; email?: string }): Promise<void> {
    await updateAdminUser(id, { ...payload });
  }

  async updateDoctorProfileAdmin(id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
    await updateAdminUser(id, { ...payload });
  }

  async approveDoctor(id: string): Promise<void> {
    await updateAdminUser(id, { approvalStatus: 'approved' });
  }
}

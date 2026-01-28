import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { User } from '@/domain/entities/User';
import { IAdminUserService, AdminUsersPage } from '@/application/ports/IAdminUserService';
import { getAllUsers, getUsersPage, getUserById, getDoctorProfile, resetUserPassword, deleteUserAccount, createAdminUser } from '@/infrastructure/queries/users';
import { apiUpdateUser } from '@/network/admin';

export class AdminUserService implements IAdminUserService {
  async getAllUsers(): Promise<User[]> {
    return getAllUsers();
  }

  async getUsersPage(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<AdminUsersPage> {
    return getUsersPage(pageSize, cursor);
  }

  async getUserById(id: string): Promise<User | null> {
    return getUserById(id);
  }

  async getDoctorProfile(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null> {
    return getDoctorProfile(id);
  }

  async resetUserPassword(id: string): Promise<{ resetLink?: string }> {
    await resetUserPassword(id);
    return {};
  }

  async deleteUserAccount(id: string): Promise<void> {
    await deleteUserAccount(id);
  }

  async createAdminUser(payload: { name: string; surname: string; email: string; password: string }): Promise<User> {
    return createAdminUser(payload);
  }

  async updateUserAdmin(id: string, payload: { name?: string; surname?: string; role?: User['role']; email?: string }): Promise<void> {
    await apiUpdateUser({ id, userFields: { ...payload } });
  }

  async updateDoctorProfileAdmin(id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
    await apiUpdateUser({ id, doctorFields: { ...payload } });
  }

  async approveDoctor(id: string): Promise<void> {
    await apiUpdateUser({ id, approveDoctor: true });
  }
}

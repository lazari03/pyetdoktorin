import type { QueryDocumentSnapshot } from 'firebase/firestore';
import type { User } from '@/domain/entities/User';

export type AdminUsersPage = {
  items: User[];
  total: number;
  nextCursor?: QueryDocumentSnapshot;
};

export interface IAdminUserService {
  getAllUsers(): Promise<User[]>;
  getUsersPage(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<AdminUsersPage>;
  getUserById(id: string): Promise<User | null>;
  getDoctorProfile(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null>;
  resetUserPassword(id: string): Promise<{ resetLink?: string }>;
  deleteUserAccount(id: string): Promise<void>;
  createAdminUser(payload: { name: string; surname: string; email: string; password: string; role: User['role']; phone?: string }): Promise<User>;
  updateUserAdmin(id: string, payload: { name?: string; surname?: string; role?: User['role']; email?: string }): Promise<void>;
  updateDoctorProfileAdmin(id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void>;
  approveDoctor(id: string): Promise<void>;
}

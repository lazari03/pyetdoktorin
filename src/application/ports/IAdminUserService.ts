import type { User } from '@/domain/entities/User';
import type { UserRole } from '@/domain/entities/UserRole';

export interface AdminUserItem extends User {
  [key: string]: unknown;
}

export type AdminUsersPage = {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
};

export interface AdminUserCreatePayload {
  name: string;
  surname: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

export type AdminUserUpdatePayload = Partial<{
  name: string;
  surname: string;
  email: string;
  role: UserRole;
  patientNotes: string;
  allergies: string;
  chronicConditions: string;
  phone: string;
  specialization: string;
  bio: string;
  specializations: string[];
  approvalStatus: 'pending' | 'approved';
}>;

export interface IAdminUserService {
  getAllUsers(): Promise<User[]>;
  getUsersByRole(role: string, pageSize: number): Promise<User[]>;
  getUsersPage(page: number, pageSize: number, search?: string): Promise<AdminUsersPage>;
  getUserById(id: string): Promise<User | null>;
  getDoctorProfile(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null>;
  resetUserPassword(id: string): Promise<{ resetLink?: string }>;
  deleteUserAccount(id: string): Promise<void>;
  createAdminUser(payload: AdminUserCreatePayload): Promise<User>;
  updateUserAdmin(id: string, payload: AdminUserUpdatePayload): Promise<void>;
  updateDoctorProfileAdmin(id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void>;
  approveDoctor(id: string): Promise<void>;
}

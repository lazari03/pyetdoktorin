import { backendFetch } from './backendClient';
import type { User } from '@/domain/entities/User';
import type { UserRole } from '@/domain/entities/UserRole';

export interface AdminUsersResponse {
  items: Array<User & Record<string, unknown>>;
  total: number;
  page: number;
  pageSize: number;
}

export interface FetchAdminUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: UserRole | string;
}

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
  patientNotes?: string;
  allergies?: string;
  chronicConditions?: string;
  phone?: string;
  specialization?: string;
  bio?: string;
  specializations?: string[];
  approvalStatus?: 'pending' | 'approved';
}>;

export async function fetchAdminUsers(params: FetchAdminUsersParams = {}) {
  const query = new URLSearchParams();
  if (typeof params.page === 'number') query.set('page', String(params.page));
  if (typeof params.pageSize === 'number') query.set('pageSize', String(params.pageSize));
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', String(params.role));
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return backendFetch<AdminUsersResponse>(`/api/users${suffix}`);
}

export async function fetchAdminUser(id: string) {
  return backendFetch<User & Record<string, unknown>>(`/api/users/${id}`);
}

export async function createAdminUser(payload: AdminUserCreatePayload) {
  return backendFetch<{ id: string; role: UserRole }>(`/api/users`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(id: string, payload: AdminUserUpdatePayload) {
  return backendFetch(`/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminUser(id: string) {
  return backendFetch(`/api/users/${id}`, {
    method: 'DELETE',
  });
}

export async function resetAdminUserPassword(id: string) {
  return backendFetch<{ resetLink?: string }>(`/api/users/${id}/reset-password`, {
    method: 'POST',
  });
}

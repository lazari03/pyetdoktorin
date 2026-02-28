import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import { fetchUsers, fetchUserById, fetchDoctorById, fetchUsersPage, UsersPage, upsertUser, updateDoctorProfile } from '@/network/firebase/users';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import { createAdminUser as createAdminUserRequest, resetAdminUserPassword, deleteAdminUser } from '@/network/adminUsers';
import { fetchAppointmentsForUser, fetchAppointmentsForDoctor } from '@/network/firebase/appointments';

export async function getAllUsers(): Promise<User[]> {
  return fetchUsers();
}

export async function getUsersPage(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<UsersPage> {
  return fetchUsersPage(pageSize, cursor);
}

export async function getUserById(firebaseId: string): Promise<User | null> {
  return fetchUserById(firebaseId);
}

export async function getDoctorProfile(firebaseId: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string }) | null> {
  return fetchDoctorById(firebaseId);
}

export async function getUserAppointmentCount(userId: string): Promise<number> {
  const apps = await fetchAppointmentsForUser(userId);
  return apps.length;
}

export async function getDoctorAppointmentCount(doctorId: string): Promise<number> {
  const apps = await fetchAppointmentsForDoctor(doctorId);
  return apps.length;
}

export async function createAdminUser(payload: { name: string; surname: string; email: string; password: string; role: UserRole; phone?: string }): Promise<User> {
  const res = await createAdminUserRequest({ ...payload });
  return { id: res.id, email: payload.email, role: payload.role } as User;
}

export async function resetUserPassword(userId: string): Promise<void> {
  await resetAdminUserPassword(userId);
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await deleteAdminUser(userId);
}

export async function updateUserFields(user: Partial<User> & { id: string }): Promise<void> {
  await upsertUser(user);
}

export async function updateDoctorFields(id: string, fields: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
  await updateDoctorProfile(id, fields);
}

import type { User } from '@/domain/entities/User';
import { UserRole } from '@/domain/entities/UserRole';
import { fetchAppointmentsForDoctor } from '@/network/firebase/appointments';
import { fetchUsers } from '@/network/firebase/users';

export async function getTopDoctorsByAppointments(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
  const users = await fetchUsers();
  const doctors = users.filter(u => u.role === UserRole.Doctor);
  const results: Array<{ doctor: User; count: number }> = [];
  for (const doc of doctors) {
    const apps = await fetchAppointmentsForDoctor(doc.id);
    results.push({ doctor: doc, count: apps.length });
  }
  return results.sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function getTopDoctorsByRequests(limit = 5): Promise<Array<{ doctor: User; count: number }>> {
  // For now, treat requests equal to appointments; adjust when a requests collection exists.
  return getTopDoctorsByAppointments(limit);
}

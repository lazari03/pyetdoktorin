import { UserRole } from '@/domain/entities/UserRole';

const APPOINTMENT_LIST_ROLES = new Set<UserRole>([
  UserRole.Admin,
  UserRole.Doctor,
  UserRole.Patient,
]);

const PRESCRIPTION_LIST_ROLES = new Set<UserRole>([
  UserRole.Admin,
  UserRole.Doctor,
  UserRole.Patient,
  UserRole.Pharmacy,
]);

export function normalizeUserRole(raw: unknown): UserRole | null {
  if (typeof raw !== 'string') return null;
  const value = raw.toLowerCase();
  return Object.values(UserRole).includes(value as UserRole) ? (value as UserRole) : null;
}

export function canListAppointmentsForRole(role: UserRole): boolean {
  return APPOINTMENT_LIST_ROLES.has(role);
}

export function canListPrescriptionsForRole(role: UserRole): boolean {
  return PRESCRIPTION_LIST_ROLES.has(role);
}

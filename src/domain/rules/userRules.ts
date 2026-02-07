import { UserRole } from '../entities/UserRole';

export function isDoctor(role: UserRole): boolean {
  return role === UserRole.Doctor;
}

export function isPatient(role: UserRole): boolean {
  return role === UserRole.Patient;
}

export function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== 'string') return null;
  const normalized = role.toLowerCase();
  return Object.values(UserRole).includes(normalized as UserRole) ? (normalized as UserRole) : null;
}

export function hasRole(role: unknown, allowed: UserRole[]): boolean {
  const normalized = normalizeRole(role);
  return !!normalized && allowed.includes(normalized);
}

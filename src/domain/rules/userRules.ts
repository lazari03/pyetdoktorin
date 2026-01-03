import { UserRole } from '../entities/UserRole';

export function isDoctor(role: UserRole): boolean {
  return role === UserRole.Doctor;
}

export function isPatient(role: UserRole): boolean {
  return role === UserRole.Patient;
}

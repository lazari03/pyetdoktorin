import { UserRole } from '../entities/UserRole';

export function toUserRole(role: string): UserRole | undefined {
  return Object.values(UserRole).includes(role as UserRole) ? (role as UserRole) : undefined;
}

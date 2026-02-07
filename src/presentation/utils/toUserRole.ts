import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';

export function toUserRole(role: unknown): UserRole | undefined {
  return normalizeRole(role) ?? undefined;
}

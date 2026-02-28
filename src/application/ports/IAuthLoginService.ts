import type { UserRole } from '@/domain/entities/UserRole';

export interface IAuthLoginService {
  login(email: string, password: string): Promise<{ role: UserRole }>;
  testConnection(): Promise<void>;
}

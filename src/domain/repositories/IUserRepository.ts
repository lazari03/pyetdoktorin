import { UserRole } from '../entities/UserRole';

export interface IUserRepository {
  getById(id: string): Promise<{ id: string; role: UserRole } | null>;
  getByRole(role: UserRole): Promise<Array<{ id: string; role: UserRole }>>;
  create(payload: { id: string; role: UserRole }): Promise<void>;
  update(id: string, updates: Partial<{ role: UserRole }>): Promise<void>;
  authenticate(email: string, password: string): Promise<{ id: string; role: UserRole } | null>;
  isProfileIncomplete(role: UserRole, userId: string): Promise<boolean>;
  delete(id: string): Promise<void>;
}

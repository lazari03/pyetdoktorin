import type { IAdminUserService } from './ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class GetUsersByRoleUseCase {
  constructor(private service: IAdminUserService) {}
  async execute(role: string, pageSize: number): Promise<User[]> {
    return this.service.getUsersByRole(role, pageSize);
  }
}

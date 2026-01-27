import { IAdminUserService } from '@/application/ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class GetAllUsersUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(): Promise<User[]> {
    return this.adminUserService.getAllUsers();
  }
}

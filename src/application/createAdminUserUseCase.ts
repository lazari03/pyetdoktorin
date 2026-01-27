import { IAdminUserService } from '@/application/ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class CreateAdminUserUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(payload: { name: string; surname: string; email: string; password: string }): Promise<User> {
    return this.adminUserService.createAdminUser(payload);
  }
}

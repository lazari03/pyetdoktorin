import { IAdminUserService } from '@/application/ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class UpdateAdminUserUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string, payload: { name?: string; surname?: string; role?: User['role']; email?: string }): Promise<void> {
    await this.adminUserService.updateUserAdmin(id, payload);
  }
}

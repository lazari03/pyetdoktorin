import { IAdminUserService } from '@/application/ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class GetAdminUserByIdUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string): Promise<User | null> {
    return this.adminUserService.getUserById(id);
  }
}

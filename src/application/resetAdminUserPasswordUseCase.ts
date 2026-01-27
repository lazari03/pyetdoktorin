import { IAdminUserService } from '@/application/ports/IAdminUserService';

export class ResetAdminUserPasswordUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string): Promise<{ resetLink?: string }> {
    return this.adminUserService.resetUserPassword(id);
  }
}

import { IAdminUserService } from '@/application/ports/IAdminUserService';

export class DeleteUserAccountUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string): Promise<void> {
    await this.adminUserService.deleteUserAccount(id);
  }
}

import { IAdminUserService, AdminUsersPage } from '@/application/ports/IAdminUserService';

export class GetUsersPageUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(page: number, pageSize: number): Promise<AdminUsersPage> {
    return this.adminUserService.getUsersPage(page, pageSize);
  }
}

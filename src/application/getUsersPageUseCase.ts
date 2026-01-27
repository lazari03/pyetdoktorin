import { IAdminUserService, AdminUsersPage } from '@/application/ports/IAdminUserService';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

export class GetUsersPageUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(pageSize: number, cursor?: QueryDocumentSnapshot): Promise<AdminUsersPage> {
    return this.adminUserService.getUsersPage(pageSize, cursor);
  }
}

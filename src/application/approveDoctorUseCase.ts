import { IAdminUserService } from '@/application/ports/IAdminUserService';

export class ApproveDoctorUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string): Promise<void> {
    await this.adminUserService.approveDoctor(id);
  }
}

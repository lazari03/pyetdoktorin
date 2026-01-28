import { IAdminUserService } from '@/application/ports/IAdminUserService';

export class UpdateAdminDoctorProfileUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string, payload: { specialization?: string; bio?: string; specializations?: string[] }): Promise<void> {
    await this.adminUserService.updateDoctorProfileAdmin(id, payload);
  }
}

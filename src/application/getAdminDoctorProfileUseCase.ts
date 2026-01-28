import { IAdminUserService } from '@/application/ports/IAdminUserService';
import type { User } from '@/domain/entities/User';

export class GetAdminDoctorProfileUseCase {
  constructor(private adminUserService: IAdminUserService) {}

  async execute(id: string): Promise<(User & { name?: string; surname?: string; specialization?: string; bio?: string; specializations?: string[] }) | null> {
    return this.adminUserService.getDoctorProfile(id);
  }
}

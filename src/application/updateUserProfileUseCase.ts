import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';
import { IAuthService } from '@/application/ports/IAuthService';

export class UpdateUserProfileUseCase {
  constructor(
    private profileService: IUserProfileService,
    private authService?: IAuthService
  ) {}

  async execute(userId: string, data: UserProfileData): Promise<void> {
    if (data.email && this.authService) {
      await this.authService.updateUserEmail(userId, data.email);
    }
    await this.profileService.updateProfile(userId, data);
  }
}

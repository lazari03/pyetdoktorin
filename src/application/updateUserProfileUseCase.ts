import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';

export class UpdateUserProfileUseCase {
  constructor(private profileService: IUserProfileService) {}

  async execute(userId: string, data: UserProfileData): Promise<void> {
    await this.profileService.updateProfile(userId, data);
  }
}

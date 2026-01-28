import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';

export class GetUserProfileUseCase {
  constructor(private profileService: IUserProfileService) {}

  async execute(userId: string): Promise<UserProfileData | null> {
    return this.profileService.getProfile(userId);
  }
}

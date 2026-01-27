import { IUserProfileService } from '@/application/ports/IUserProfileService';

export class UploadProfilePictureUseCase {
  constructor(private profileService: IUserProfileService) {}

  async execute(userId: string, file: File): Promise<string> {
    return this.profileService.uploadProfilePicture(userId, file);
  }
}

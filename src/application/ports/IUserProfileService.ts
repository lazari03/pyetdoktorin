export interface UserProfileData {
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  about?: string;
  specializations?: string[];
  education?: string[];
  profilePicture?: string;
}

export interface IUserProfileService {
  getProfile(userId: string): Promise<UserProfileData | null>;
  updateProfile(userId: string, data: UserProfileData): Promise<void>;
  uploadProfilePicture(userId: string, file: File): Promise<string>;
}

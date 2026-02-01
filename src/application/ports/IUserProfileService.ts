export interface UserProfileData {
  name?: string;
  surname?: string;
  email?: string;
  phoneNumber?: string;
  about?: string;
  specializations?: string[];
  education?: string[];
  profilePicture?: string;
  lastCheckupDate?: string; // ISO yyyy-mm-dd
  nextCheckupDueDate?: string; // ISO yyyy-mm-dd
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredLanguage?: string;
  timeZone?: string;
  communicationPreference?: 'video' | 'voice' | 'chat';
  shareSummaryConsent?: boolean;
}

export interface IUserProfileService {
  getProfile(userId: string): Promise<UserProfileData | null>;
  updateProfile(userId: string, data: UserProfileData): Promise<void>;
  uploadProfilePicture(userId: string, file: File): Promise<string>;
}

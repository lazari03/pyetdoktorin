import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';
import { auth } from '@/config/firebaseconfig';
import { fetchCurrentUserProfile, updateCurrentUserProfile } from '@/network/currentUser';

async function waitForCurrentUser(timeoutMs = 3000, intervalMs = 120) {
  if (auth.currentUser) return auth.currentUser;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (auth.currentUser) return auth.currentUser;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  return null;
}

async function getRequiredIdToken(): Promise<string> {
  const user = auth.currentUser ?? (await waitForCurrentUser(8000));
  if (!user) throw new Error('UPLOAD_AUTH_REQUIRED');
  return user.getIdToken();
}

export class UserProfileService implements IUserProfileService {
  async getProfile(userId: string): Promise<UserProfileData | null> {
    const profile = await fetchCurrentUserProfile();
    if (profile.uid !== userId) return null;
    return profile;
  }

  async updateProfile(userId: string, data: UserProfileData): Promise<void> {
    const currentUser = auth.currentUser ?? (await waitForCurrentUser(8000));
    if (!currentUser || currentUser.uid !== userId) {
      throw new Error('PROFILE_UPDATE_FORBIDDEN');
    }
    await updateCurrentUserProfile(data);
  }

  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);
    formData.append('userId', userId);

    const token = await getRequiredIdToken();

    const uploadRes = await fetch('/api/profile/upload-profile-picture', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!uploadRes.ok) {
      let errorCode = 'UPLOAD_FAILED';
      try {
        const payload = await uploadRes.json();
        if (payload?.error) {
          errorCode = String(payload.error);
        }
      } catch {
        // ignore
      }
      throw new Error(errorCode);
    }

    const { publicUrl } = await uploadRes.json();
    if (!publicUrl) throw new Error('No public URL returned from upload');

    await this.updateProfile(userId, { profilePicture: publicUrl });
    return publicUrl;
  }
}

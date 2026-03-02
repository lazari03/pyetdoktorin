import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';
import { auth } from '@/config/firebaseconfig';

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
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return null;
    return userDoc.data() as UserProfileData;
  }

  async updateProfile(userId: string, data: UserProfileData): Promise<void> {
    await setDoc(doc(db, 'users', userId), data, { merge: true });
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

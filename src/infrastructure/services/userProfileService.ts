import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { IUserProfileService, UserProfileData } from '@/application/ports/IUserProfileService';

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

    const uploadRes = await fetch('/api/profile/upload-profile-picture', {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error('Failed to upload: ' + errorText);
    }

    const { publicUrl } = await uploadRes.json();
    if (!publicUrl) throw new Error('No public URL returned from upload');

    await this.updateProfile(userId, { profilePicture: publicUrl });
    return publicUrl;
  }
}

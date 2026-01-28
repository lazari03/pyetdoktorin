import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';

export async function getUserPhoneNumber(userId: string): Promise<string | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.phoneNumber || null;
    }
    return null;
  } catch {
    return null;
  }
}

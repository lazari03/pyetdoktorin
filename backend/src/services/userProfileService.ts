import { getFirebaseAdmin } from '@/config/firebaseAdmin';

export interface UserProfile {
  name?: string;
  surname?: string;
  email?: string;
  phone?: string;
  pharmacyName?: string;
  clinicName?: string;
  signatureDataUrl?: string;
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const admin = getFirebaseAdmin();
  const doc = await admin.firestore().collection('users').doc(uid).get();
  if (!doc.exists) return null;
  return doc.data() as UserProfile;
}

export function buildDisplayName(profile: UserProfile | null, fallback: string): string {
  if (!profile) return fallback;
  const parts = [profile.name, profile.surname].filter((value) => Boolean(value));
  const combined = parts.join(' ').trim();
  return combined || profile.name || fallback;
}

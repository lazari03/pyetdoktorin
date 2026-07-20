import type { UserProfileData } from '@/application/ports/IUserProfileService';
import { backendFetch } from '@/network/backendClient';
import type { UserRole } from '@/domain/entities/UserRole';

export type CurrentUserProfile = UserProfileData & {
  id: string;
  uid: string;
  role: UserRole | string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  surname?: string;
  phoneNumber?: string;
};

// Several independent call sites (AuthContext, useMyProfile, CurrentUserRepository)
// hit this on the same page load. A short TTL + in-flight dedupe collapses those
// into one network request without requiring every caller to share a React hook.
const PROFILE_CACHE_TTL_MS = 10_000;
let cachedProfile: { promise: Promise<CurrentUserProfile>; expiresAt: number } | null = null;

export async function fetchCurrentUserProfile() {
  if (cachedProfile && cachedProfile.expiresAt > Date.now()) {
    return cachedProfile.promise;
  }
  const promise = backendFetch<CurrentUserProfile>('/api/users/me');
  cachedProfile = { promise, expiresAt: Date.now() + PROFILE_CACHE_TTL_MS };
  promise.catch(() => {
    if (cachedProfile?.promise === promise) cachedProfile = null;
  });
  return promise;
}

export async function updateCurrentUserProfile(data: Partial<UserProfileData> & { email?: string }) {
  cachedProfile = null;
  return backendFetch<{ ok: boolean; profile: CurrentUserProfile }>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

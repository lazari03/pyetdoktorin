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

export async function fetchCurrentUserProfile() {
  return backendFetch<CurrentUserProfile>('/api/users/me');
}

export async function updateCurrentUserProfile(data: Partial<UserProfileData> & { email?: string }) {
  return backendFetch<{ ok: boolean; profile: CurrentUserProfile }>('/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

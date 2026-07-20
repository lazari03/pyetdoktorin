import useSWR from 'swr';
import { fetchCurrentUserProfile, type CurrentUserProfile } from '@/network/currentUser';

// Shared across AuthContext and useMyProfile so /api/users/me is fetched
// once per uid instead of once per consumer.
export function useCurrentUserProfile(uid: string | null) {
  return useSWR<CurrentUserProfile>(
    uid ? ['current-user-profile', uid] : null,
    () => fetchCurrentUserProfile(),
    { dedupingInterval: 10_000 },
  );
}

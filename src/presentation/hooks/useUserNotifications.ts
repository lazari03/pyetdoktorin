import useSWR from 'swr';
import { useDI } from '@/context/DIContext';
import type { UserNotificationDTO } from '@/application/ports/IUserNotificationsService';

const POLL_MS = 60_000;

export function useUserNotifications(uid: string | null | undefined) {
  const { listUserNotificationsUseCase } = useDI();
  return useSWR<{ items: UserNotificationDTO[]; unreadCount: number }>(
    uid ? ['user-notifications', uid] : null,
    () => listUserNotificationsUseCase.execute(),
    { refreshInterval: POLL_MS },
  );
}

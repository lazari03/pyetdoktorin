'use client';

import { useCallback, useMemo } from 'react';
import { useNotificationReadStore } from '@/store/notificationReadStore';

const EMPTY_ARRAY: string[] = [];

/**
 * Per-user read/unread tracking for notifications, backed by useNotificationReadStore
 * (Zustand + persist) so every mounted consumer — the topbar popover and the full
 * notifications page — reacts to the same live, localStorage-synced state.
 */
export function useNotificationReadState(userId?: string | null) {
  const readIds = useNotificationReadStore((s) => (userId ? s.readIdsByUser[userId] ?? EMPTY_ARRAY : EMPTY_ARRAY));
  const markReadRaw = useNotificationReadStore((s) => s.markRead);
  const markManyReadRaw = useNotificationReadStore((s) => s.markManyRead);
  const pruneToRaw = useNotificationReadStore((s) => s.pruneTo);

  const readSet = useMemo(() => new Set(readIds), [readIds]);

  const isRead = useCallback((id: string) => readSet.has(id), [readSet]);

  const markRead = useCallback((id: string) => {
    if (!userId) return;
    markReadRaw(userId, id);
  }, [userId, markReadRaw]);

  const markManyRead = useCallback((ids: string[]) => {
    if (!userId) return;
    markManyReadRaw(userId, ids);
  }, [userId, markManyReadRaw]);

  const pruneTo = useCallback((liveIds: string[]) => {
    if (!userId) return;
    pruneToRaw(userId, liveIds);
  }, [userId, pruneToRaw]);

  const unreadCount = useCallback((ids: string[]) => ids.filter((id) => !readSet.has(id)).length, [readSet]);

  return useMemo(
    () => ({ isRead, markRead, markManyRead, pruneTo, unreadCount }),
    [isRead, markRead, markManyRead, pruneTo, unreadCount]
  );
}

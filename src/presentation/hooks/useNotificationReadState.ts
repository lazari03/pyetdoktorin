'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { useDI } from '@/context/DIContext';

const EMPTY_ARRAY: string[] = [];

/**
 * Per-user read/unread tracking for notifications, persisted server-side
 * (account-bound) rather than in localStorage — read state must survive
 * logout/login and follow the account, not the browser.
 * `optimisticIds` bridges the gap between a mark-read click and the next
 * SWR revalidation so the UI updates instantly.
 */
export function useNotificationReadState(userId?: string | null) {
  const { listReadMarksUseCase, markReadMarkUseCase, markManyReadMarksUseCase } = useDI();
  const { data: serverIds, mutate } = useSWR<string[]>(
    userId ? ['read-marks', userId] : null,
    () => listReadMarksUseCase.execute(),
  );
  const [optimisticIds, setOptimisticIds] = useState<string[]>(EMPTY_ARRAY);

  useEffect(() => {
    setOptimisticIds(EMPTY_ARRAY);
  }, [userId]);

  const readSet = useMemo(
    () => new Set([...(serverIds ?? EMPTY_ARRAY), ...optimisticIds]),
    [serverIds, optimisticIds],
  );

  const isRead = useCallback((id: string) => readSet.has(id), [readSet]);

  const markRead = useCallback((id: string) => {
    if (!userId || readSet.has(id)) return;
    setOptimisticIds((prev) => [...prev, id]);
    markReadMarkUseCase.execute(id).then(() => mutate()).catch(() => {});
  }, [userId, readSet, markReadMarkUseCase, mutate]);

  const markManyRead = useCallback((ids: string[]) => {
    const newIds = ids.filter((id) => !readSet.has(id));
    if (!userId || newIds.length === 0) return;
    setOptimisticIds((prev) => [...prev, ...newIds]);
    markManyReadMarksUseCase.execute(newIds).then(() => mutate()).catch(() => {});
  }, [userId, readSet, markManyReadMarksUseCase, mutate]);

  // ponytail: read marks live in Firestore now, not localStorage, so the
  // original "stop the local set growing forever" concern doesn't apply —
  // pruning stays a no-op, kept only so callers don't need to change.
  const pruneTo = useCallback((_liveIds: string[]) => {}, []);

  const unreadCount = useCallback((ids: string[]) => ids.filter((id) => !readSet.has(id)).length, [readSet]);

  return useMemo(
    () => ({ isRead, markRead, markManyRead, pruneTo, unreadCount }),
    [isRead, markRead, markManyRead, pruneTo, unreadCount]
  );
}

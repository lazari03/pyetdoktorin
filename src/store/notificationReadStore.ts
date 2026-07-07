import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationReadState {
  readIdsByUser: Record<string, string[]>;
  markRead: (userId: string, id: string) => void;
  markManyRead: (userId: string, ids: string[]) => void;
  pruneTo: (userId: string, liveIds: string[]) => void;
}

/**
 * Persisted per-user set of "read" notification ids, shared live across every mounted
 * component (topbar popover, full notifications page) via Zustand's subscription model —
 * no manual pub/sub, no SSR-snapshot edge cases. `persist` handles localStorage sync.
 */
export const useNotificationReadStore = create<NotificationReadState>()(
  persist(
    (set) => ({
      readIdsByUser: {},
      markRead: (userId, id) => set((state) => {
        const current = state.readIdsByUser[userId] ?? [];
        if (current.includes(id)) return state;
        return { readIdsByUser: { ...state.readIdsByUser, [userId]: [...current, id] } };
      }),
      markManyRead: (userId, ids) => set((state) => {
        const current = new Set(state.readIdsByUser[userId] ?? []);
        let changed = false;
        ids.forEach((id) => {
          if (!current.has(id)) {
            current.add(id);
            changed = true;
          }
        });
        if (!changed) return state;
        return { readIdsByUser: { ...state.readIdsByUser, [userId]: Array.from(current) } };
      }),
      pruneTo: (userId, liveIds) => set((state) => {
        const current = state.readIdsByUser[userId] ?? [];
        const liveSet = new Set(liveIds);
        const next = current.filter((id) => liveSet.has(id));
        if (next.length === current.length) return state;
        return { readIdsByUser: { ...state.readIdsByUser, [userId]: next } };
      }),
    }),
    { name: 'pd_notif_read' }
  )
);

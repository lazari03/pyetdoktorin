

import { create } from 'zustand';
import { auth } from '@/config/firebaseconfig';

interface VideoState {
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  roomCode: string | null;
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => void;
  generateRoomCodeAndStore: (params: { appointmentId: string; userId: string; role: string }) => Promise<string>;
}

export const useVideoStore = create<VideoState>()((set) => ({
  isInCall: false,
  error: null,
  loading: false,
  isAuthenticated: false,
  userId: null,
  userName: null,
  roomCode: null,
  setAuthStatus: (isAuthenticated, userId, userName) => {
    set({ isAuthenticated, userId, userName, loading: false });
  },
  generateRoomCodeAndStore: async ({ appointmentId, userId, role }) => {
    set({ loading: true, error: null });
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Your session has expired. Please log in again.');
      }
      const idToken = await currentUser.getIdToken();
      const { generateRoomCodeAndToken } = await import('../infrastructure/services/100msService');
      const data = await generateRoomCodeAndToken({
        user_id: userId,
        room_id: appointmentId,
        role,
        idToken,
      });
      if (!data.sessionToken) throw new Error('No session token returned from server');
      set({ roomCode: data.roomCode ?? null, loading: false });
      return data.sessionToken;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },
}));

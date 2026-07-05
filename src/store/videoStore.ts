
import { create } from 'zustand';

interface GenerateRoomCodeParams {
  appointmentId: string;
  userId: string;
  role: string;
}

type GenerateRoomCodeFn = (params: GenerateRoomCodeParams) => Promise<string>;

interface VideoState {
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  roomCode: string | null;
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => void;
  generateRoomCodeAndStore: (params: GenerateRoomCodeParams, generateRoomCode: GenerateRoomCodeFn) => Promise<string>;
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
  generateRoomCodeAndStore: async ({ appointmentId, userId, role }, generateRoomCode) => {
    set({ loading: true, error: null });
    try {
      const sessionToken = await generateRoomCode({ appointmentId, userId, role });
      set({ roomCode: null, loading: false });
      return sessionToken;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },
}));

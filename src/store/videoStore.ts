

import { create } from 'zustand';

interface VideoState {
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  roomCode: string | null;
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => void;
  generateRoomCodeAndStore: (params: { appointmentId: string, userId: string, role: string, userName: string }) => Promise<string>;
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
  generateRoomCodeAndStore: async ({ appointmentId, userId, role, userName }) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/100ms/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, room_id: appointmentId, role }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate 100ms room: ${errorText}`);
      }
      const data = await response.json();
      console.log('[100ms] generateRoomCodeAndStore API response:', data);
      if (!data.roomCode) throw new Error('No roomCode returned from 100ms API');
      set({ roomCode: data.roomCode, loading: false });
      window.localStorage.setItem('videoSessionRoomCode', data.roomCode);
      window.localStorage.setItem('videoSessionUserName', userName);
      return data.roomCode;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },
}));

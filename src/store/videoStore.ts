import { create } from 'zustand';
import { fullMediaCleanup } from '../utils/mediaUtils';

interface VideoState {
  token: string | null;
  rtcToken: string | null;
  channelName: string | null;
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  appId: string | null;
  uid: number | null;
  messages?: any[];
  // Actions
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => void;
  joinCall: (appointmentId: string, uid: number, userId?: string) => Promise<string>;
  endCall: () => void;
  resetVideoState: () => void;
  fetchTokens: (appointmentId: string, uid: number, userId: string) => Promise<void>;
}

export const useVideoStore = create<VideoState>()((set, get) => ({
  token: null,
  rtcToken: null,
  channelName: null,
  isInCall: false,
  error: null,
  loading: false,
  isAuthenticated: false,
  userId: null,
  userName: null,
  appId: null,
  uid: null,

  setAuthStatus: (isAuthenticated, userId, userName) => {
    set({ isAuthenticated, userId, userName, loading: false });
  },

  joinCall: async (appointmentId, uid, userIdOverride) => {
    set({ loading: true, error: null });
    try {
      if (!get().isAuthenticated) {
        throw new Error('User is not authenticated. Please log in first.');
      }
      const userId = userIdOverride || get().userId;
      const sanitizedChannelName = appointmentId.replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64);
      const sanitizedUserId = userId && userId.toString().length > 0
        ? userId.toString().replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64)
        : `user_${uid}_${Date.now()}`.substring(0, 64);
      const response = await fetch('/api/agora/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName: sanitizedChannelName, uid, userId: sanitizedUserId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate token: ${errorText}`);
      }
      const data = await response.json();
      if (!data.rtcToken) {
        throw new Error('RTC token not received from server');
      }
      set({
        token: data.token || data.rtcToken,
        rtcToken: data.rtcToken,
        channelName: sanitizedChannelName,
        userId: data.userId,
        isInCall: true,
        loading: false,
        appId: data.appId,
        uid,
      });
      return `/dashboard/appointments/video-session?channel=${sanitizedChannelName}&rtcToken=${encodeURIComponent(data.rtcToken)}&appId=${encodeURIComponent(data.appId)}&userId=${encodeURIComponent(data.userId)}`;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
      throw error;
    }
  },

  fetchTokens: async (appointmentId, uid, userId) => {
    set({ loading: true, error: null });
    try {
      const channelName = appointmentId.replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64);
      const safeUserId = userId.replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64);
      const response = await fetch('/api/agora/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelName, uid, userId: safeUserId }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate token: ${errorText}`);
      }
      const data = await response.json();
      set({
        rtcToken: data.rtcToken,
        channelName,
        uid,
        userId: safeUserId,
        loading: false,
        error: null,
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
    }
  },

  endCall: () => {
    set({ isInCall: false });
    if (typeof window !== 'undefined' && window._agora) {
      fullMediaCleanup({
        client: window._agora.client,
        localTracks: window._agora.localTracks,
        localCameraTrack: window._agora.localCameraTrack,
        localMicrophoneTrack: window._agora.localMicrophoneTrack,
      });
    } else {
      fullMediaCleanup();
    }
    get().resetVideoState();
  },

  resetVideoState: () => {
    set({
      token: null,
      rtcToken: null,
      channelName: null,
      isInCall: false,
      error: null,
      uid: null,
    });
  },
}));

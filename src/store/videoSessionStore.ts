import { create } from "zustand";
import { fetchAgoraTokens } from "../network/agoraApi"; // Use the Axios-based API function

interface VideoSessionState {
  rtcToken: string | null;
  channelName: string | null;
  uid: number | null;
  userId: string | null;
  loading: boolean;
  error: string | null;
  fetchTokens: (appointmentId: string, uid: number, userId: string) => Promise<void>;
  reset: () => void;
}

export const useVideoSessionStore = create<VideoSessionState>((set) => ({
  rtcToken: null,
  channelName: null,
  uid: null,
  userId: null,
  loading: false,
  error: null,
  fetchTokens: async (appointmentId, uid, userId) => {
    set({ loading: true, error: null });
    try {
      // Sanitize channel name and userId
      const channelName = appointmentId.replace(/[^a-zA-Z0-9_=+-]/g, "_").substring(0, 64);
      const safeUserId = userId.replace(/[^a-zA-Z0-9_=+-]/g, "_").substring(0, 64);

      // Fetch tokens using the Axios-based API function
      const data = await fetchAgoraTokens(channelName, uid, safeUserId);

      set({
        rtcToken: data.rtcToken,
        channelName,
        uid,
        userId: safeUserId,
        loading: false,
        error: null,
      });
    } catch (error: unknown) {
      set({ error: (error as Error).message || "Unknown error", loading: false });
    }
  },
  reset: () => set({
    rtcToken: null,
    channelName: null,
    uid: null,
    userId: null,
    loading: false,
    error: null,
  }),
}));
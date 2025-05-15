import { create } from "zustand";

interface VideoSessionState {
  rtcToken: string | null;
  rtmToken: string | null;
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
  rtmToken: null,
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

      const res = await fetch("/api/agora/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelName, uid, userId: safeUserId }),
      });
      if (!res.ok) throw new Error("Failed to fetch Agora tokens");
      const data = await res.json();
      set({
        rtcToken: data.rtcToken,
        rtmToken: data.rtmToken,
        channelName,
        uid,
        userId: safeUserId,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      set({ error: error.message || "Unknown error", loading: false });
    }
  },
  reset: () => set({
    rtcToken: null,
    rtmToken: null,
    channelName: null,
    uid: null,
    userId: null,
    loading: false,
    error: null,
  }),
}));

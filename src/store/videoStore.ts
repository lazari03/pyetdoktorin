import { create } from 'zustand';

interface VideoState {
  token: string | null;
  rtcToken: string | null; // Add specific RTC token
  channelName: string | null;
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null; // User Id
  userName: string | null;
  appId: string | null; // Add appId to the store
  
  // Actions
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => void;
  joinCall: (appointmentId: string, uid: number) => Promise<string>;
  endCall: () => void;
  resetVideoState: () => void;
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
  appId: null, // Store the appId
  
  // Replace checkAuthStatus with setAuthStatus that can be called from components
  setAuthStatus: (isAuthenticated: boolean, userId: string | null, userName: string | null) => {
    set({
      isAuthenticated,
      userId,
      userName,
      loading: false
    });
  },
  
  joinCall: async (appointmentId: string, uid: number) => {
    set({ loading: true, error: null });
    
    try {
      // Check authentication first
      if (!get().isAuthenticated) {
        throw new Error('User is not authenticated. Please log in first.');
      }
      
      const userId = get().userId;
      
      // Sanitize and truncate the channel name
      const sanitizedChannelName = appointmentId
        .replace(/[^a-zA-Z0-9_-]/g, "_") 
        .slice(0, 64);
      
      const sanitizedUserId = userId && userId.toString().length > 0 
        ? userId.toString().replace(/[^a-zA-Z0-9_=+-]/g, '_').substring(0, 64) 
        : `user_${uid}_${Date.now()}`.substring(0, 64);
      
      console.log("Requesting Agora tokens with:", {
        channelName: sanitizedChannelName,
        uid: uid,
        userId: sanitizedUserId
      });
      
      const response = await fetch('/api/agora/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          channelName: sanitizedChannelName, 
          uid,
          userId: sanitizedUserId
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate token: ${errorText}`);
      }
      
      const data = await response.json();
      console.log("Received API response:", {
        hasToken: !!data.token,
        hasRtcToken: !!data.rtcToken,
        hasAppId: !!data.appId,
        userId: data.userId,
        channelName: data.channelName
      });
      
      if (!data.rtcToken) {
        throw new Error('RTC token not received from server');
      }
      
      // Store all tokens and info
      set({
        token: data.token || data.rtcToken,
        rtcToken: data.rtcToken,
        channelName: sanitizedChannelName,
        userId: data.userId, // Always use the sanitized userId from API
        isInCall: true,
        loading: false,
        appId: data.appId, // Store the appId from the API
      });
      
      // Return URL for redirection including all tokens
      return `/dashboard/appointments/video-session?channel=${sanitizedChannelName}&rtcToken=${encodeURIComponent(data.rtcToken)}&appId=${encodeURIComponent(data.appId)}&userId=${encodeURIComponent(data.userId)}`;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error', 
        loading: false 
      });
      throw error;
    }
  },
  
  endCall: () => {
    set({
      isInCall: false,
    });
  },
  
  resetVideoState: () => {
    set({
      token: null,
      rtcToken: null,
      channelName: null,
      isInCall: false,
      error: null,
    });
  },
}));

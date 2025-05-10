import { create } from 'zustand';
import { auth } from '../config/firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

interface VideoState {
  token: string | null;
  channelName: string | null;
  isInCall: boolean;
  error: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  userId: string | null;
  userName: string | null;
  
  // Actions
  checkAuthStatus: () => (() => void) | undefined;
  joinCall: (appointmentId: string, uid: number) => Promise<string>;
  endCall: () => void;
  resetVideoState: () => void;
}

export const useVideoStore = create<VideoState>()((set, get) => ({
  token: null,
  channelName: null,
  isInCall: false,
  error: null,
  loading: false,
  isAuthenticated: false,
  userId: null,
  userName: null,
  
  checkAuthStatus: () => {
    set({ loading: true });
    
    try {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          // User is signed in
          set({ 
            isAuthenticated: true,
            userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email || 'User',
            loading: false
          });
        } else {
          // User is signed out
          set({ 
            isAuthenticated: false,
            userId: null,
            userName: null,
            loading: false
          });
        }
      });
      
      // Return unsubscribe function for cleanup
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up auth state listener:", error);
      set({ 
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown auth error'
      });
      return undefined; // Return undefined in case of error
    }
  },
  
  joinCall: async (appointmentId: string, uid: number) => {
    set({ loading: true, error: null });
    
    try {
      // Check authentication first
      if (!get().isAuthenticated) {
        throw new Error('User is not authenticated. Please log in first.');
      }
      
      // Sanitize and truncate the channel name
      const sanitizedChannelName = appointmentId
        .replace(/[^a-zA-Z0-9_-]/g, "_") 
        .slice(0, 64);
      
      const response = await fetch('/api/agora/generate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          channelName: sanitizedChannelName, 
          uid
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate token: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.token) {
        throw new Error('No token received from server');
      }
      
      // Store token and channel info
      set({
        token: data.token,
        channelName: sanitizedChannelName,
        isInCall: true,
        loading: false,
      });
      
      // Return URL for redirection
      return `/dashboard/appointments/video-session?channel=${sanitizedChannelName}&token=${data.token}`;
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
      channelName: null,
      isInCall: false,
      error: null,
    });
  },
}));

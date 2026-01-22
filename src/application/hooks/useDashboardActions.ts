
import { useCallback } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';

export function useDashboardActions() {
  const { user } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow } = useAppointmentStore();

  // Join call using Zustand store and localStorage hydration
  const handleJoinCall = useCallback(async (appointmentId: string) => {
    try {
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      // For dashboard actions, assume patient role and use user name
      const role = 'patient';
      const patientName = user.name || 'Guest';
      const roomCode = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role,
        userName: patientName,
      });
      window.localStorage.setItem('videoSessionRoomCode', roomCode);
      window.localStorage.setItem('videoSessionUserName', patientName);
      window.location.href = '/dashboard/appointments/video-session';
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user, setAuthStatus, generateRoomCodeAndStore]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    storeHandlePayNow(appointmentId, amount);
  }, [storeHandlePayNow]);

  return { handleJoinCall, handlePayNow };
}

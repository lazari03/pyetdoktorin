import { useCallback } from 'react';
import { useAppointmentStore } from '../store/appointmentStore';
import { useVideoStore } from '../store/videoStore';
import { useAuth } from '../context/AuthContext';

export function useDashboardActions() {
  const { user } = useAuth();
  const { joinCall, setAuthStatus } = useVideoStore();
  const { handlePayNow: storeHandlePayNow } = useAppointmentStore();

  const handleJoinCall = useCallback(async (appointmentId: string) => {
    try {
      if (!user || !user.uid) {
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      if (typeof setAuthStatus === 'function') {
        setAuthStatus(!!user, user.uid, user.name || null);
      }
      const videoSessionUrl = await joinCall(appointmentId, 0);
      window.location.href = videoSessionUrl;
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user, joinCall, setAuthStatus]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    storeHandlePayNow(appointmentId, amount);
  }, [storeHandlePayNow]);

  return { handleJoinCall, handlePayNow };
}

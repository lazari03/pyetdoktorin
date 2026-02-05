import { useCallback } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';

export function useDashboardActions() {
  const { user, role } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow } = useAppointmentStore();
  const { handlePayNowUseCase } = useDI();

  // Join call using Zustand store and localStorage hydration
  const handleJoinCall = useCallback(async (appointmentId: string) => {
    try {
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      const effectiveRole = role === 'doctor' ? 'doctor' : 'patient';
      const sessionToken = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role: effectiveRole,
      });
      const url = `/dashboard/appointments/video-session?session=${encodeURIComponent(sessionToken)}`;
      window.location.href = url;
    } catch (error) {
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user, role, setAuthStatus, generateRoomCodeAndStore]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase));
  }, [storeHandlePayNow, handlePayNowUseCase]);

  return { handleJoinCall, handlePayNow };
}

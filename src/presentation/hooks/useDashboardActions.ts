import { useCallback } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

export function useDashboardActions() {
  const { user, role } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow } = useAppointmentStore();
  const { handlePayNowUseCase } = useDI();

  // Join call using Zustand store and localStorage hydration
  const handleJoinCall = useCallback(async (appointmentId: string) => {
    try {
      trackAnalyticsEvent('appointment_join_attempt', {
        appointmentId,
        role: role === UserRole.Doctor ? 'doctor' : 'patient',
      });
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        trackAnalyticsEvent('appointment_join_blocked', { appointmentId, reason: 'unauthenticated' });
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      const effectiveRole = role === UserRole.Doctor ? UserRole.Doctor : UserRole.Patient;
      const sessionToken = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role: effectiveRole,
      });
      const url = `/dashboard/appointments/video-session?session=${encodeURIComponent(sessionToken)}`;
      trackAnalyticsEvent('appointment_join_success', { appointmentId, role: effectiveRole });
      window.location.href = url;
    } catch (error) {
      trackAnalyticsEvent('appointment_join_failed', {
        appointmentId,
        reason: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
      });
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [user, role, setAuthStatus, generateRoomCodeAndStore]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    trackAnalyticsEvent('payment_initiated', { appointmentId, amount });
    storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase));
  }, [storeHandlePayNow, handlePayNowUseCase]);

  return { handleJoinCall, handlePayNow };
}

import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { normalizeAppointmentStatus } from '@/presentation/utils/appointmentStatus';

export function useDashboardActions() {
  const { t } = useTranslation();
  const { user, role } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow, fetchAppointments } = useAppointmentStore();
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
        alert(t('signInToBookError') || 'You must be logged in to join a call. Please log in and try again.');
        return;
      }
      if (role) {
        await fetchAppointments(role);
      }
      const { appointments, isAppointmentPast } = useAppointmentStore.getState();
      const appointment = appointments.find((item) => item.id === appointmentId);
      if (!appointment) {
        trackAnalyticsEvent('appointment_join_blocked', { appointmentId, reason: 'not_found' });
        alert(t('unknownError'));
        return;
      }
      if (isAppointmentPast(appointment)) {
        trackAnalyticsEvent('appointment_join_blocked', { appointmentId, reason: 'appointment_past' });
        alert(t('appointmentPast') || 'This appointment has already passed.');
        return;
      }
      if (role !== UserRole.Doctor) {
        const status = normalizeAppointmentStatus(appointment.status);
        if (status !== 'accepted') {
          trackAnalyticsEvent('appointment_join_blocked', { appointmentId, reason: 'waiting_for_acceptance' });
          alert(t('waitingForAcceptance'));
          return;
        }
        if (!appointment.isPaid) {
          const isProcessing = appointment.paymentStatus === 'processing';
          trackAnalyticsEvent('appointment_join_blocked', {
            appointmentId,
            reason: isProcessing ? 'payment_processing' : 'payment_required',
          });
          alert(isProcessing ? t('paymentProcessing') : t('paymentRequired'));
          return;
        }
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
  }, [fetchAppointments, role, setAuthStatus, generateRoomCodeAndStore, t, user]);

  const handlePayNow = useCallback((appointmentId: string, amount: number) => {
    trackAnalyticsEvent('payment_initiated', { appointmentId, amount });
    storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase));
  }, [storeHandlePayNow, handlePayNowUseCase]);

  return { handleJoinCall, handlePayNow };
}

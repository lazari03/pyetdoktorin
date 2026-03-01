import { useCallback } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { useTranslation } from 'react-i18next';
import { getAppointmentErrorMessage, getVideoErrorMessage } from '@/presentation/utils/errorMessages';
import { syncPaddlePaymentWithRetry } from '@/network/payments';
import { clearPaymentProcessing } from '@/network/appointments';
import { listAppointments } from '@/network/appointments';

export function useDashboardActions() {
  const { user, role } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { handlePayNow: storeHandlePayNow, setAppointments } = useAppointmentStore();
  const { handlePayNowUseCase } = useDI();
  const { t } = useTranslation();

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
        alert(t('joinCallLoginRequired'));
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
      const translatedMessage = getVideoErrorMessage(error, t);
      alert(translatedMessage ?? t('genericError'));
    }
  }, [user, role, setAuthStatus, generateRoomCodeAndStore, t]);

  const handlePayNow = useCallback(async (appointmentId: string, amount: number) => {
    trackAnalyticsEvent('payment_initiated', { appointmentId, amount });
    try {
      await storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase), {
        onClose: () => {
          clearPaymentProcessing(appointmentId).catch((error) => {
            console.warn('Payment processing clear failed', error);
          });
          (async () => {
            try {
              await syncPaddlePaymentWithRetry(appointmentId);
            } catch (error) {
              console.warn('Payment sync failed', error);
            } finally {
              listAppointments()
                .then((refreshed) => setAppointments(refreshed.items))
                .catch((error) => console.warn('Appointment refresh after payment failed', error));
            }
          })();
        },
      });
    } catch (error) {
      trackAnalyticsEvent('payment_failed', {
        appointmentId,
        reason: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
      });
      const translatedMessage = getAppointmentErrorMessage(error, t);
      alert(translatedMessage ?? t('genericError'));
    }
  }, [storeHandlePayNow, handlePayNowUseCase, setAppointments, t]);

  return { handleJoinCall, handlePayNow };
}

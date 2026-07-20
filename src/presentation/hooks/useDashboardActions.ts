import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useVideoStore } from '@/store/videoStore';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { useTranslation } from 'react-i18next';
import { getVideoErrorMessage } from '@/presentation/utils/errorMessages';
import { dashboardVideoSessionUrl, dashboardPayUrl } from '@/navigation/paths';
import { useToast } from '@/presentation/components/Toast/ToastProvider';
import { getAuthToken } from '@/application/auth/tokenHolder';

export function useDashboardActions() {
  const { user, role } = useAuth();
  const { setAuthStatus, generateRoomCodeAndStore } = useVideoStore();
  const { generateRoomCodeUseCase } = useDI();
  const { t } = useTranslation();
  const { toast } = useToast();
  const router = useRouter();

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
        toast({ variant: 'error', message: t('joinCallLoginRequired') });
        return;
      }
      const effectiveRole = role === UserRole.Doctor ? UserRole.Doctor : UserRole.Patient;

      const generateRoomCode = async (params: { appointmentId: string; userId: string; role: string }) => {
        const idToken = getAuthToken();
        if (!idToken) throw new Error('Your session has expired. Please log in again.');
        const data = await generateRoomCodeUseCase.execute({
          user_id: params.userId,
          room_id: params.appointmentId,
          role: params.role,
          idToken,
        });
        if (!data.sessionToken) throw new Error('No session token returned from server');
        return data.sessionToken;
      };

      const sessionToken = await generateRoomCodeAndStore({
        appointmentId,
        userId: user.uid,
        role: effectiveRole,
      }, generateRoomCode);
      const url = dashboardVideoSessionUrl(sessionToken);
      trackAnalyticsEvent('appointment_join_success', { appointmentId, role: effectiveRole });
      window.location.href = url;
    } catch (error) {
      trackAnalyticsEvent('appointment_join_failed', {
        appointmentId,
        reason: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
      });
      const translatedMessage = getVideoErrorMessage(error, t);
      toast({ variant: 'error', message: translatedMessage ?? t('genericError') });
    }
  }, [user, role, setAuthStatus, generateRoomCodeAndStore, t, toast]);

  const handlePayNow = useCallback(async (appointmentId: string, amount: number) => {
    trackAnalyticsEvent('payment_initiated', { appointmentId, amount });
    router.push(dashboardPayUrl(appointmentId));
  }, [router]);

  return { handleJoinCall, handlePayNow };
}

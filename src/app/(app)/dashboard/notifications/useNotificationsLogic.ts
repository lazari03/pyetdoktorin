import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useReciepeStore } from '@/store/reciepeStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { useDI } from '@/context/DIContext';
import type { Appointment } from '@/domain/entities/Appointment';

interface PrescriptionNotification {
  id: string;
  title: string;
  patientName?: string;
  doctorName?: string;
  pharmacyName?: string;
  status: string;
  updatedAt: number;
}

export function useNotificationsLogic(nav: NavigationCoordinator) {
  const { appointments, loading: isLoading, error, subscribeAppointments, fetchAppointments, setAppointments } = useAppointmentStore();
  const { user, role } = useAuth();
  const {
    dismissNotificationUseCase,
    updateAppointmentStatusAndNotifyUseCase,
  } = useDI();
  const userRole = role;
  const [dismissedLocal, setDismissedLocal] = useState<Set<string>>(() => new Set());
  // Shared with the doctor/patient/pharmacy reciepe pages, so this is fetched
  // once per role/uid instead of independently per consumer.
  const rawReciepes = useReciepeStore((s) => s.reciepes);
  const prescriptionsLoading = useReciepeStore((s) => s.loading);
  const prescriptionsError = useReciepeStore((s) => s.error);
  const fetchReciepes = useReciepeStore((s) => s.fetchReciepes);

  const didRedirectRef = useRef(false);
  useEffect(() => {
    if (!user?.uid) {
      if (!didRedirectRef.current) {
        didRedirectRef.current = true;
        nav.toLogin();
      }
      return;
    }
    if (!role) return;
    // Appointments list is only relevant for doctor/patient notifications.
    // Subscribed (not one-shot) so the bell and notification cards stay live
    // — SectionShell mounts this hook for the whole dashboard section, so
    // this is the one place that needs to keep polling regardless of which
    // page within the section is currently active.
    if (role === UserRole.Doctor || role === UserRole.Patient) {
      const unsubscribe = subscribeAppointments(user.uid, role);
      return unsubscribe;
    }
  }, [subscribeAppointments, user?.uid, nav, role]);

  const appointmentNotifications = useMemo(() => {
    if (!userRole) return [] as Appointment[];
    if (!user?.uid) return [] as Appointment[];

    const userId = user.uid;

    const filtered = appointments
      .filter((a) => {
        if (dismissedLocal.has(a.id)) return false;
        if (a.dismissedBy?.[userId]) return false;
        if (userRole === UserRole.Doctor) return String(a.status).toLowerCase() === 'pending';
        return true;
      })
      .sort((a, b) => {
        const at = Number.isFinite(new Date(a.createdAt).getTime()) ? new Date(a.createdAt).getTime() : 0;
        const bt = Number.isFinite(new Date(b.createdAt).getTime()) ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });

    return filtered;
  }, [appointments, dismissedLocal, user?.uid, userRole]);

  useEffect(() => {
    if (!user?.uid || !userRole) return;
    fetchReciepes(userRole, user.uid);
  }, [user?.uid, userRole, fetchReciepes]);

  const prescriptionNotifications = useMemo<PrescriptionNotification[]>(() => {
    return rawReciepes
      .filter((p) => {
        const status = p.status || 'pending';
        if (userRole === UserRole.Patient || userRole === UserRole.Pharmacy) {
          return true;
        }
        return status !== 'pending';
      })
      .map((p) => ({
        id: p.id || '',
        title: p.title || '',
        patientName: p.patientName,
        doctorName: p.doctorName,
        pharmacyName: p.pharmacyName,
        status: p.status || 'pending',
        updatedAt: p.statusUpdatedAt ?? p.createdAt ?? 0,
      }))
      .filter((p) => p.id)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [rawReciepes, userRole]);

  const handleDismissNotification = useCallback(async (id: string) => {
    setDismissedLocal((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    if (!user?.uid) return;
    try {
      // Optimistically update global appointment state so dashboards stop showing dismissed items.
      // Use the latest store snapshot to avoid overwriting newer subscription data.
      const latest = useAppointmentStore.getState().appointments;
      setAppointments(
        latest.map((a) =>
          a.id === id
            ? { ...a, dismissedBy: { ...(a.dismissedBy ?? {}), [user.uid]: true } }
            : a
        )
      );

      await dismissNotificationUseCase.execute(id, user.uid);
      trackAnalyticsEvent('notification_dismissed', { appointmentId: id });
    } catch {
      trackAnalyticsEvent('notification_dismiss_failed', { appointmentId: id });
    }
  }, [dismissNotificationUseCase, setAppointments, user]);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      await updateAppointmentStatusAndNotifyUseCase.execute(appointmentId, action);
      const latest = useAppointmentStore.getState().appointments;
      setAppointments(
        latest.map((a) => (a.id === appointmentId ? { ...a, status: action as Appointment['status'] } : a))
      );
      setDismissedLocal((prev) => {
        const next = new Set(prev);
        next.add(appointmentId);
        return next;
      });
      trackAnalyticsEvent('appointment_decision', { appointmentId, action });
    } catch {
      trackAnalyticsEvent('appointment_decision_failed', { appointmentId, action });
    }
  }, [setAppointments, updateAppointmentStatusAndNotifyUseCase]);

  const retry = useCallback(() => {
    if (!userRole) return;
    // Avoid calling the appointments API for roles that don't have access to it.
    if (userRole === UserRole.Doctor || userRole === UserRole.Patient) {
      fetchAppointments(userRole);
    }
  }, [fetchAppointments, userRole]);

  return {
    isLoading:
      (userRole === UserRole.Doctor || userRole === UserRole.Patient ? isLoading : false) ||
      prescriptionsLoading,
    error: userRole === UserRole.Doctor || userRole === UserRole.Patient ? error : prescriptionsError,
    userRole,
    appointmentNotifications,
    prescriptionNotifications,
    handleDismissNotification,
    handleAppointmentAction,
    retry,
  };
}

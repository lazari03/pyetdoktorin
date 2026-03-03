import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { useDI } from '@/context/DIContext';
import type { ReciepePayload } from '@/application/ports/IReciepeService';
import type { Appointment } from '@/domain/entities/Appointment';
import { backendFetch } from '@/network/backendClient';

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
  const { appointments, loading: isLoading, error, fetchAppointments, setAppointments } = useAppointmentStore();
  const { user, role } = useAuth();
  const {
    getReciepesByDoctorUseCase,
    getReciepesByPatientUseCase,
    getReciepesByPharmacyUseCase,
  } = useDI();
  const userRole = role;
  const [dismissedLocal, setDismissedLocal] = useState<Set<string>>(() => new Set());
  const [prescriptionNotifications, setPrescriptionNotifications] = useState<PrescriptionNotification[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionsError, setPrescriptionsError] = useState<unknown>(null);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    if (!user?.uid) {
      nav.toLogin();
      return;
    }
    if (!role) return;
    didInitRef.current = true;
    // Appointments list is only relevant for doctor/patient notifications.
    if (role === UserRole.Doctor || role === UserRole.Patient) {
      fetchAppointments(role);
    }
  }, [fetchAppointments, user?.uid, nav, role]);

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
    const fetchPrescriptionUpdates = async () => {
      if (!user?.uid) return;
      setPrescriptionsLoading(true);
      setPrescriptionsError(null);
      try {
        let reciepes: ReciepePayload[] = [];
        if (userRole === UserRole.Doctor) {
          reciepes = await getReciepesByDoctorUseCase.execute(user.uid);
        } else if (userRole === UserRole.Patient) {
          reciepes = await getReciepesByPatientUseCase.execute(user.uid);
        } else if (userRole === UserRole.Pharmacy) {
          reciepes = await getReciepesByPharmacyUseCase.execute(user.uid);
        }
        const mapped = (reciepes || [])
          .filter((p) => p.status && p.status !== 'pending')
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
        setPrescriptionNotifications(mapped);
      } catch (err) {
        setPrescriptionNotifications([]);
        setPrescriptionsError(err);
      } finally {
        setPrescriptionsLoading(false);
      }
    };
    if (userRole) {
      fetchPrescriptionUpdates();
    }
  }, [user?.uid, userRole, getReciepesByDoctorUseCase, getReciepesByPatientUseCase, getReciepesByPharmacyUseCase]);

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

      // Persist on the backend (source of truth).
      await backendFetch(`/api/notifications/dismiss/${id}`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid }),
      });
      trackAnalyticsEvent('notification_dismissed', { appointmentId: id });
    } catch {
      trackAnalyticsEvent('notification_dismiss_failed', { appointmentId: id });
    }
  }, [setAppointments, user]);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      await backendFetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });
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
  }, [setAppointments]);

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

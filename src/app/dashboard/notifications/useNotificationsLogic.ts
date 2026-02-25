import { useCallback, useEffect, useState, useRef } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { backendFetch } from '@/network/backendClient';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';
import { useDI } from '@/context/DIContext';
import type { ReciepePayload } from '@/application/ports/IReciepeService';

interface AppointmentDetail {
  id: string;
  patientName: string | null;
  doctorName: string | null;
  preferredDate: string;
  notes: string;
}

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
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const { user } = useAuth();
  const {
    getReciepesByDoctorUseCase,
    getReciepesByPatientUseCase,
    getReciepesByPharmacyUseCase,
  } = useDI();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetail[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    (AppointmentDetail & { status?: string; dismissedBy?: Record<string, boolean> })[]
  >([]);
  const [prescriptionNotifications, setPrescriptionNotifications] = useState<PrescriptionNotification[]>([]);

  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    const fetchUserRoleAndAppointments = async () => {
      if (!user?.uid) {
        nav.toLogin();
        return;
      }
      const response = await backendFetch<{ role: string }>('/api/notifications/role');
      const role = normalizeRole(response.role);
      if (role) {
        setUserRole(role);
        await fetchAppointments(role);
      } else {
        nav.toLogin();
      }
    };
    fetchUserRoleAndAppointments();
  }, [fetchAppointments, user?.uid, nav]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (appointments.length > 0) {
        const ids = appointments.map((a) => a.id);
        const response = await backendFetch<{ items: AppointmentDetail[] }>('/api/notifications/appointment-details', {
          method: 'POST',
          body: JSON.stringify({ ids }),
        });
        setAppointmentDetails(response.items || []);
      }
    };
    fetchDetails();
  }, [appointments]);

  useEffect(() => {
    const fetchPrescriptionUpdates = async () => {
      if (!user?.uid) return;
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
      } catch {
        setPrescriptionNotifications([]);
      }
    };
    if (userRole) {
      fetchPrescriptionUpdates();
    }
  }, [user?.uid, userRole, getReciepesByDoctorUseCase, getReciepesByPatientUseCase, getReciepesByPharmacyUseCase]);

  useEffect(() => {
    const fetchRelevantAppointments = async () => {
      if (!user?.uid) return;
      if (userRole === UserRole.Doctor) {
        const pending = appointmentDetails.filter((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return found?.status === 'pending' && !(found?.dismissedBy && found.dismissedBy[user.uid]);
        });
        setPendingAppointments(pending);
      } else if (userRole === UserRole.Patient) {
        const withStatus = appointmentDetails.map((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return { ...appointment, status: found?.status || 'pending', doctorName: found?.doctorName || appointment.doctorName, dismissedBy: found?.dismissedBy };
        }).filter((appt) => !(appt.dismissedBy && appt.dismissedBy[user.uid]));
        setPendingAppointments(withStatus);
      }
    };
    if (userRole && appointmentDetails.length > 0) {
      fetchRelevantAppointments();
    }
  }, [userRole, appointmentDetails, appointments, user]);

  const handleDismissNotification = useCallback(async (id: string) => {
    setPendingAppointments((prev) => prev.filter((appt) => appt.id !== id));
    if (!user?.uid) return;
    try {
      await backendFetch(`/api/notifications/dismiss/${id}`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.uid }),
      });
      trackAnalyticsEvent('notification_dismissed', { appointmentId: id });
    } catch {
      trackAnalyticsEvent('notification_dismiss_failed', { appointmentId: id });
    }
  }, [user]);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      await backendFetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: action }),
      });
      setPendingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );
      trackAnalyticsEvent('appointment_decision', { appointmentId, action });
    } catch {
      trackAnalyticsEvent('appointment_decision_failed', { appointmentId, action });
    }
  }, []);

  return {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    prescriptionNotifications,
    handleDismissNotification,
    handleAppointmentAction,
  };
}

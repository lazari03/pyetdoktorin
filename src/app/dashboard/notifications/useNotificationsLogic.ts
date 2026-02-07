import { useCallback, useEffect, useState } from 'react';
import { useAppointmentStore } from '@/store/appointmentStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { backendFetch } from '@/network/backendClient';

interface AppointmentDetail {
  id: string;
  patientName: string | null;
  doctorName: string | null;
  preferredDate: string;
  notes: string;
}

export function useNotificationsLogic(nav: NavigationCoordinator) {
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetail[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    (AppointmentDetail & { status?: string; dismissedBy?: Record<string, boolean> })[]
  >([]);

  useEffect(() => {
    const fetchUserRoleAndAppointments = async () => {
      if (!user?.uid) {
        nav.toLogin();
        return;
      }
      const userId = user.uid;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAppointments, user, nav]);

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
    await backendFetch(`/api/notifications/dismiss/${id}`, {
      method: 'POST',
      body: JSON.stringify({ userId: user.uid }),
    });
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
    } catch {}
  }, []);

  return {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    handleDismissNotification,
    handleAppointmentAction,
  };
}

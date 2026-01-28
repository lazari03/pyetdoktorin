import { useCallback, useEffect, useState } from 'react';
import { useAppointmentStore } from '../../../store/appointmentStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';

export function useNotificationsLogic(nav: NavigationCoordinator) {
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const { user } = useAuth();
  const {
    fetchAppointmentsUseCase,
    getNotificationUserRoleUseCase,
    fetchAppointmentDetailsUseCase,
    dismissNotificationUseCase,
    updateAppointmentStatusAndNotifyUseCase,
  } = useDI();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string; status?: string; dismissedBy?: Record<string, boolean> }[]
  >([]);

  useEffect(() => {
    const fetchUserRoleAndAppointments = async () => {
      if (!user?.uid) {
        nav.toLogin();
        return;
      }
      const userId = user.uid;
      const role = await getNotificationUserRoleUseCase.execute(userId);
      if (role) {
        setUserRole(role);
        await fetchAppointments(
          userId,
          role === 'doctor',
          (id: string, isDoc: boolean) => fetchAppointmentsUseCase.execute(id, isDoc)
        );
      } else {
        nav.toLogin();
      }
    };
    fetchUserRoleAndAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAppointments, user, fetchAppointmentsUseCase, getNotificationUserRoleUseCase]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (appointments.length > 0) {
        const details = await fetchAppointmentDetailsUseCase.execute(appointments);
        setAppointmentDetails(details);
      }
    };
    fetchDetails();
  }, [appointments, fetchAppointmentDetailsUseCase]);

  useEffect(() => {
    const fetchRelevantAppointments = async () => {
      if (!user?.uid) return;
      if (userRole === 'doctor') {
        const pending = appointmentDetails.filter((appointment) => {
          const found = appointments.find((a) => a.id === appointment.id);
          return found?.status === 'pending' && !(found?.dismissedBy && found.dismissedBy[user.uid]);
        });
        setPendingAppointments(pending);
      } else if (userRole === 'patient') {
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
    await dismissNotificationUseCase.execute(id, user.uid);
  }, [dismissNotificationUseCase, user]);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      await updateAppointmentStatusAndNotifyUseCase.execute(appointmentId, action);
      setPendingAppointments((prev) =>
        prev.filter((appointment) => appointment.id !== appointmentId)
      );
    } catch {}
  }, [updateAppointmentStatusAndNotifyUseCase]);

  return {
    isLoading,
    error,
    userRole,
    pendingAppointments,
    handleDismissNotification,
    handleAppointmentAction,
  };
}

import { useCallback, useEffect, useState } from 'react';
import { auth } from '../../../config/firebaseconfig';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { FirebaseAppointmentRepository } from '@/infrastructure/repositories/FirebaseAppointmentRepository';
import { getUserRole, fetchAppointmentDetails, dismissNotification } from '@/domain/notificationService';
import { updateAppointmentStatusAndNotify } from '@/domain/appointmentNotificationService';
import { useAppointmentStore } from '../../../store/appointmentStore';
import type { NavigationCoordinator } from '@/navigation/NavigationCoordinator';

export function useNotificationsLogic(nav: NavigationCoordinator) {
  const { appointments, loading: isLoading, error, fetchAppointments } = useAppointmentStore();
  const appointmentRepo = new FirebaseAppointmentRepository();
  const fetchAppointmentsUseCase = new FetchAppointmentsUseCase(appointmentRepo);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [appointmentDetails, setAppointmentDetails] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string }[]
  >([]);
  const [pendingAppointments, setPendingAppointments] = useState<
    { id: string; patientName: string | null; doctorName: string | null; preferredDate: string; notes: string; status?: string; dismissedBy?: Record<string, boolean> }[]
  >([]);

  useEffect(() => {
    const fetchUserRoleAndAppointments = async () => {
      if (!auth.currentUser) {
        nav.toLogin();
        return;
      }
      const userId = auth.currentUser.uid;
      const role = await getUserRole(userId);
      if (role) {
        setUserRole(role);
        await fetchAppointments(
          userId,
          role === 'doctor',
          (userId: string, isDoctor: boolean) => fetchAppointmentsUseCase.execute(userId, isDoctor)
        );
      } else {
        nav.toLogin();
      }
    };
    fetchUserRoleAndAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAppointments]);

  useEffect(() => {
    const fetchDetails = async () => {
      if (appointments.length > 0) {
        const details = await fetchAppointmentDetails(appointments);
        setAppointmentDetails(details);
      }
    };
    fetchDetails();
  }, [appointments]);

  useEffect(() => {
    const fetchRelevantAppointments = async () => {
      if (!auth.currentUser) return;
      const user = auth.currentUser;
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
  }, [userRole, appointmentDetails, appointments]);

  const handleDismissNotification = useCallback(async (id: string) => {
    setPendingAppointments((prev) => prev.filter((appt) => appt.id !== id));
    if (!auth.currentUser) return;
    await dismissNotification(id, auth.currentUser.uid);
  }, []);

  const handleAppointmentAction = useCallback(async (appointmentId: string, action: 'accepted' | 'rejected') => {
    try {
      await updateAppointmentStatusAndNotify(appointmentId, action);
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

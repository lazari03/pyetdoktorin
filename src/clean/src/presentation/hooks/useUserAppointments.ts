import { useState, useEffect } from 'react';
import { Appointment } from '../../../domain/entities/Appointment';
import { GetUserAppointmentsUseCase } from '../../../application/use-cases/GetUserAppointmentsUseCase';

export interface UseUserAppointmentsParams {
  userId: string;
  isDoctor: boolean;
  getUserAppointmentsUseCase: GetUserAppointmentsUseCase;
}

export interface UseUserAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refreshAppointments: () => Promise<void>;
  getUpcomingAppointments: () => Appointment[];
  getPastAppointments: () => Appointment[];
  getPendingAppointments: () => Promise<Appointment[]>;
  getConfirmedAppointments: () => Promise<Appointment[]>;
}

export const useUserAppointments = ({
  userId,
  isDoctor,
  getUserAppointmentsUseCase
}: UseUserAppointmentsParams): UseUserAppointmentsReturn => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userAppointments = await getUserAppointmentsUseCase.execute({
        userId,
        isDoctor
      });
      
      setAppointments(userAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshAppointments = async () => {
    await fetchAppointments();
  };

  const getUpcomingAppointments = (): Appointment[] => {
    return appointments.filter(appointment => {
      const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
      return appointmentDateTime > new Date() && !appointment.isPast();
    });
  };

  const getPastAppointments = (): Appointment[] => {
    return appointments.filter(appointment => appointment.isPast());
  };

  const getPendingAppointments = async (): Promise<Appointment[]> => {
    return await getUserAppointmentsUseCase.getPendingAppointments(userId, isDoctor);
  };

  const getConfirmedAppointments = async (): Promise<Appointment[]> => {
    return await getUserAppointmentsUseCase.getConfirmedAppointments(userId, isDoctor);
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId, isDoctor]);

  return {
    appointments,
    loading,
    error,
    refreshAppointments,
    getUpcomingAppointments,
    getPastAppointments,
    getPendingAppointments,
    getConfirmedAppointments
  };
};
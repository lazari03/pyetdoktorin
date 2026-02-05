import { useState } from 'react';
import { UpdateAppointmentStatusUseCase } from '../../../application/use-cases/UpdateAppointmentStatusUseCase';
import { AppointmentStatus } from '../../../domain/entities/Appointment';

export interface UseUpdateAppointmentStatusParams {
  updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase;
}

export interface UseUpdateAppointmentStatusReturn {
  updateStatus: (appointmentId: string, status: AppointmentStatus, userId: string) => Promise<boolean>;
  confirmAppointment: (appointmentId: string, userId: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string, userId: string) => Promise<boolean>;
  completeAppointment: (appointmentId: string, userId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  resetError: () => void;
}

export const useUpdateAppointmentStatus = ({
  updateAppointmentStatusUseCase
}: UseUpdateAppointmentStatusParams): UseUpdateAppointmentStatusReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (
    appointmentId: string, 
    status: AppointmentStatus, 
    userId: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await updateAppointmentStatusUseCase.execute({
        appointmentId,
        status,
        userId
      });
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Failed to update appointment status');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const confirmAppointment = async (appointmentId: string, userId: string): Promise<boolean> => {
    return await updateStatus(appointmentId, AppointmentStatus.CONFIRMED, userId);
  };

  const cancelAppointment = async (appointmentId: string, userId: string): Promise<boolean> => {
    return await updateStatus(appointmentId, AppointmentStatus.CANCELLED, userId);
  };

  const completeAppointment = async (appointmentId: string, userId: string): Promise<boolean> => {
    return await updateStatus(appointmentId, AppointmentStatus.COMPLETED, userId);
  };

  const resetError = () => {
    setError(null);
  };

  return {
    updateStatus,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    loading,
    error,
    resetError
  };
};
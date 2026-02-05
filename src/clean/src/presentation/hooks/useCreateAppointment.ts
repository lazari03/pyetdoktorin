import { useState } from 'react';
import { CreateAppointmentUseCase, CreateAppointmentDTO } from '../../../application/use-cases/CreateAppointmentUseCase';
import { Appointment } from '../../../domain/entities/Appointment';

export interface UseCreateAppointmentParams {
  createAppointmentUseCase: CreateAppointmentUseCase;
}

export interface UseCreateAppointmentReturn {
  createAppointment: (data: CreateAppointmentDTO) => Promise<Appointment | null>;
  loading: boolean;
  error: string | null;
  resetError: () => void;
}

export const useCreateAppointment = ({
  createAppointmentUseCase
}: UseCreateAppointmentParams): UseCreateAppointmentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAppointment = async (data: CreateAppointmentDTO): Promise<Appointment | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await createAppointmentUseCase.execute(data);
      
      if (result.success) {
        return result.appointment;
      } else {
        setError(result.error || 'Failed to create appointment');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    createAppointment,
    loading,
    error,
    resetError
  };
};
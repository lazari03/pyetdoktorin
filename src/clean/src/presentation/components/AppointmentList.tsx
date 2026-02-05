import React from 'react';
import { useUserAppointments } from '../hooks/useUserAppointments';
import { useUpdateAppointmentStatus } from '../hooks/useUpdateAppointmentStatus';
import { AppointmentCard } from './AppointmentCard';
import { GetUserAppointmentsUseCase } from '../../application/use-cases/GetUserAppointmentsUseCase';
import { UpdateAppointmentStatusUseCase } from '../../application/use-cases/UpdateAppointmentStatusUseCase';

export interface AppointmentListProps {
  userId: string;
  isDoctor: boolean;
  getUserAppointmentsUseCase: GetUserAppointmentsUseCase;
  updateAppointmentStatusUseCase: UpdateAppointmentStatusUseCase;
  onPayAppointment?: (appointmentId: string) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  userId,
  isDoctor,
  getUserAppointmentsUseCase,
  updateAppointmentStatusUseCase,
  onPayAppointment
}) => {
  const {
    appointments,
    loading,
    error,
    refreshAppointments,
    getUpcomingAppointments,
    getPastAppointments
  } = useUserAppointments({
    userId,
    isDoctor,
    getUserAppointmentsUseCase
  });

  const {
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    loading: statusLoading
  } = useUpdateAppointmentStatus({
    updateAppointmentStatusUseCase
  });

  const handleConfirmAppointment = async (appointmentId: string) => {
    const success = await confirmAppointment(appointmentId, userId);
    if (success) {
      await refreshAppointments();
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const success = await cancelAppointment(appointmentId, userId);
    if (success) {
      await refreshAppointments();
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    const success = await completeAppointment(appointmentId, userId);
    if (success) {
      await refreshAppointments();
    }
  };

  const upcomingAppointments = getUpcomingAppointments();
  const pastAppointments = getPastAppointments();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="text-red-800">
          <strong>Error:</strong> {error}
        </div>
        <button
          onClick={refreshAppointments}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Upcoming Appointments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upcoming Appointments
        </h2>
        
        {upcomingAppointments.length === 0 ? (
          <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            No upcoming appointments
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isDoctor={isDoctor}
                onConfirm={handleConfirmAppointment}
                onCancel={handleCancelAppointment}
                onComplete={handleCompleteAppointment}
                onPay={onPayAppointment}
                loading={statusLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Past Appointments
        </h2>
        
        {pastAppointments.length === 0 ? (
          <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
            No past appointments
          </div>
        ) : (
          <div className="space-y-4">
            {pastAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isDoctor={isDoctor}
                loading={statusLoading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
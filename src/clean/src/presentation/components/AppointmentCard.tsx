import React from 'react';
import { Appointment } from '../../../domain/entities/Appointment';

export interface AppointmentCardProps {
  appointment: Appointment;
  isDoctor: boolean;
  onConfirm?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
  onPay?: (appointmentId: string) => void;
  loading?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  isDoctor,
  onConfirm,
  onCancel,
  onComplete,
  onPay,
  loading = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  const getActionButtons = () => {
    if (loading) return null;

    const buttons = [];
    
    if (isDoctor) {
      if (appointment.isPending()) {
        buttons.push(
          <button
            key="confirm"
            onClick={() => onConfirm?.(appointment.id)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
          >
            Confirm
          </button>,
          <button
            key="cancel"
            onClick={() => onCancel?.(appointment.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel
          </button>
        );
      }
      
      if (appointment.isConfirmed() && !appointment.isPast()) {
        buttons.push(
          <button
            key="complete"
            onClick={() => onComplete?.(appointment.id)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Complete
          </button>
        );
      }
    } else {
      if (!appointment.isPaid() && !appointment.isCancelled() && !appointment.isPast()) {
        buttons.push(
          <button
            key="pay"
            onClick={() => onPay?.(appointment.id)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Pay Now
          </button>
        );
      }
      
      if (appointment.isPending() && !appointment.isPast()) {
        buttons.push(
          <button
            key="cancel"
            onClick={() => onCancel?.(appointment.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Cancel
          </button>
        );
      }
    }

    return buttons;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isDoctor ? appointment.patientName : `Dr. ${appointment.doctorName}`}
          </h3>
          <p className="text-sm text-gray-600">{appointment.appointmentType}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {formatDateTime(appointment.preferredDate, appointment.preferredTime)}
        </div>
        
        {appointment.notes && (
          <div className="text-sm text-gray-600">
            <strong>Notes:</strong> {appointment.notes}
          </div>
        )}
        
        <div className="flex items-center text-sm">
          {appointment.isPaid ? (
            <span className="text-green-600 font-medium">
              ✓ Paid
            </span>
          ) : (
            <span className="text-orange-600 font-medium">
              ⏳ Payment Pending
            </span>
          )}
        </div>
      </div>

      {appointment.isPast() && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          This appointment has passed
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {getActionButtons()}
      </div>
    </div>
  );
};
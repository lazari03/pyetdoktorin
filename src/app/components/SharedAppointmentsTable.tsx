import React from 'react';
import CenteredLoader from './CenteredLoader';
import { Appointment } from '../../models/Appointment';
import { getAppointmentAction } from '../../store/appointmentActionButton';
import { DEFAULT_APPOINTMENT_PAYMENT_AMOUNT } from '../../config/paymentConfig';

interface AppointmentsTableProps {
  appointments: Appointment[];
  role: string;
  isAppointmentPast: (appointment: Appointment) => boolean;
  handleJoinCall: (appointmentId: string) => void;
  handlePayNow: (appointmentId: string, amount: number) => void;
  showActions?: boolean;
  maxRows?: number;
  loading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  role,
  isAppointmentPast,
  handleJoinCall,
  handlePayNow,
  showActions = true,
  maxRows = 3,
  loading = false,
}) => {
  if (loading) {
    return <CenteredLoader />;
  }
  return (
    <div className="overflow-x-auto mt-6">
      <table className="table table-zebra w-full text-sm md:text-base">
        <thead>
          <tr>
            <th>Date</th>
            <th>{role === 'doctor' ? 'Patient' : 'Doctor'}</th>
            <th>Type</th>
            <th>Time</th>
            <th>Notes</th>
            <th>Status</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {appointments && appointments.length > 0 ? (
            [...appointments]
              .sort((a, b) => {
                // Sort from newest to oldest by preferredDate, then createdAt
                const dateA = new Date(a.preferredDate).getTime();
                const dateB = new Date(b.preferredDate).getTime();
                if (dateA !== dateB) return dateB - dateA;
                const createdAtA = new Date(a.createdAt).getTime();
                const createdAtB = new Date(b.createdAt).getTime();
                return createdAtB - createdAtA;
              })
              .slice(0, maxRows)
              .map((appointment) => {
                const action = getAppointmentAction(appointment, isAppointmentPast, role);
                return (
                  <tr key={appointment.id}>
                    <td>{appointment.preferredDate}</td>
                    <td>
                      {role === 'doctor'
                        ? appointment.patientName || 'N/A'
                        : (
                          <a
                            href={`/dashboard/doctor/${appointment.doctorId}`}
                            className="text-orange-500 underline hover:text-orange-700"
                          >
                            {appointment.doctorName}
                          </a>
                        )}
                    </td>
                    <td>{appointment.appointmentType}</td>
                    <td>{appointment.preferredTime}</td>
                    <td>{appointment.notes}</td>
                    <td>
                      {appointment.status === "accepted" ? (
                        <span className="text-green-500 font-bold">Accepted</span>
                      ) : appointment.status === "rejected" ? (
                        <span className="text-red-500 font-bold">Declined</span>
                      ) : appointment.status === "pending" ? (
                        <span className="text-gray-500 font-bold">Pending</span>
                      ) : (
                        <span className="text-yellow-500 font-bold">{appointment.status}</span>
                      )}
                    </td>
                    {showActions && (
                      <td>
                        {role !== 'doctor' && action.label === 'Pay Now' && !action.disabled && (
                          <button
                            className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
                            onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
                          >
                            Pay Now
                          </button>
                        )}
                        {action.label === 'Join Now' && !action.disabled && (
                          <button
                            className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={() => handleJoinCall(appointment.id)}
                          >
                            Join Now
                          </button>
                        )}
                        {action.disabled && (
                          <button
                            className="bg-gray-400 text-white font-bold py-2 px-4 rounded-full opacity-50 cursor-not-allowed"
                            disabled
                          >
                            {action.label}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
          ) : (
            <tr>
              <td colSpan={showActions ? 7 : 6} className="text-center">No appointments found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

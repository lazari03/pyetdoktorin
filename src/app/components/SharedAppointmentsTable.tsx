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
    <>
      {/* Desktop Table */}
      <div className="overflow-x-auto mt-6 hidden md:block">
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
      {/* Mobile Card List */}
      <div className="block md:hidden mt-6 space-y-4">
        {appointments && appointments.length > 0 ? (
          [...appointments]
            .sort((a, b) => {
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
                <div key={appointment.id} className="rounded-xl shadow bg-white p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">{appointment.preferredDate}</span>
                    <span className="text-xs text-gray-500">{appointment.preferredTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <span><span className="font-medium">{role === 'doctor' ? 'Patient:' : 'Doctor:'}</span> {role === 'doctor' ? appointment.patientName || 'N/A' : appointment.doctorName}</span>
                    <span><span className="font-medium">Type:</span> {appointment.appointmentType}</span>
                  </div>
                  <div className="text-sm text-gray-600"><span className="font-medium">Notes:</span> {appointment.notes}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={
                      appointment.status === "accepted"
                        ? "text-green-500 font-bold"
                        : appointment.status === "rejected"
                        ? "text-red-500 font-bold"
                        : appointment.status === "pending"
                        ? "text-gray-500 font-bold"
                        : "text-yellow-500 font-bold"
                    }>
                      {appointment.status === "accepted"
                        ? "Accepted"
                        : appointment.status === "rejected"
                        ? "Declined"
                        : appointment.status === "pending"
                        ? "Pending"
                        : appointment.status}
                    </span>
                    {showActions && (
                      <>
                        {role !== 'doctor' && action.label === 'Pay Now' && !action.disabled && (
                          <button
                            className="ml-auto bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-1 px-3 border border-orange-500 hover:border-transparent rounded-full text-xs"
                            onClick={() => handlePayNow(appointment.id, DEFAULT_APPOINTMENT_PAYMENT_AMOUNT)}
                          >
                            Pay Now
                          </button>
                        )}
                        {action.label === 'Join Now' && !action.disabled && (
                          <button
                            className="ml-auto bg-orange-500 hover:bg-orange-700 text-white font-bold py-1 px-3 rounded-full text-xs"
                            onClick={() => handleJoinCall(appointment.id)}
                          >
                            Join Now
                          </button>
                        )}
                        {action.disabled && (
                          <button
                            className="ml-auto bg-gray-400 text-white font-bold py-1 px-3 rounded-full opacity-50 cursor-not-allowed text-xs"
                            disabled
                          >
                            {action.label}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
        ) : (
          <div className="text-center text-gray-500">No appointments found.</div>
        )}
      </div>
    </>
  );
};

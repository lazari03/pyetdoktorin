import React from 'react';
import Link from 'next/link';
import { Appointment } from '../../models/Appointment';

interface AppointmentsTableProps {
  appointments: Appointment[];
  role: string;
  isAppointmentPast: (appointment: Appointment) => boolean;
  handleJoinCall: (appointmentId: string) => void;
  handlePayNow: (appointmentId: string, amount: number) => void;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
  appointments,
  role,
  isAppointmentPast,
  handleJoinCall,
  handlePayNow,
}) => {
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
            <th>Actions</th>
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
              .slice(0, 3)
              .map((appointment) => (
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
                    {appointment.status === 'accepted' ? (
                      <span className="text-green-500 font-bold">Accepted</span>
                    ) : appointment.status === 'rejected' ? (
                      <span className="text-red-500 font-bold">Declined</span>
                    ) : (
                      <span className="text-gray-500 font-bold">Pending</span>
                    )}
                  </td>
                  <td>
                    {role === 'doctor' ? (
                      (() => {
                        if (isAppointmentPast(appointment)) {
                          return (
                            <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Finished
                            </button>
                          );
                        }
                        if (appointment.status === 'accepted') {
                          return (
                            <button
                              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                              onClick={() => handleJoinCall(appointment.id)}
                            >
                              Join Now
                            </button>
                          );
                        }
                        return (
                          <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                            Waiting
                          </button>
                        );
                      })()
                    ) : (
                      (() => {
                        if (isAppointmentPast(appointment)) {
                          return (
                            <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Finished
                            </button>
                          );
                        }
                        if (appointment.status === 'rejected') {
                          return (
                            <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Declined
                            </button>
                          );
                        }
                        if (appointment.status === 'pending') {
                          return (
                            <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Pending
                            </button>
                          );
                        }
                        if (appointment.status === 'accepted' && !appointment.isPaid) {
                          return (
                            <button
                              className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
                              onClick={() => handlePayNow(appointment.id, 2100)}
                            >
                              Pay Now
                            </button>
                          );
                        }
                        if (appointment.status === 'accepted' && appointment.isPaid) {
                          return (
                            <button
                              className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                              onClick={() => handleJoinCall(appointment.id)}
                            >
                              Join Now
                            </button>
                          );
                        }
                        return (
                          <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                            Waiting
                          </button>
                        );
                      })()
                    )}
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center">
                No recent appointments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

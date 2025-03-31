"use client";

import { usePatientAppointments } from "../../hooks/usePatientAppointments";

export default function PatientDashboard() {
  const { appointments, isLoading, error } = usePatientAppointments();

  if (error) {
    console.warn(error);
    return <div>Error loading appointments.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
        <span className="ml-2">Loading appointments...</span>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl p-6">
      <h1 className="card-title mb-4">My Appointments</h1>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Doctor Name</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{new Date(appointment.createdAt).toLocaleString()}</td>
                <td>{appointment.appointmentType}</td>
                <td>{appointment.doctorName}</td> {/* Display doctor's name */}
                <td>
                  <span className={`badge ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

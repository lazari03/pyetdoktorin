"use client";

import { useEffect } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useFetchAppointments } from "../../../hooks/useFetchAppointments";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const { appointments, isDoctor } = useAppointmentStore();

  // Custom hook to handle fetching appointments and user role
  useFetchAppointments(user);

  const handlePayNow = (appointmentId: string) => {
    console.log(`Pay Now clicked for appointment ID: ${appointmentId}`);
    // Add payment logic here
  };

  const handleJoinCall = (appointmentId: string) => {
    console.log(`Join Call clicked for appointment ID: ${appointmentId}`);
    // Add join call logic here
  };

  const isCompleted = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  if (isDoctor === null) {
    // Show a loading state while determining the user's role
    return <div>Loading...</div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-lg md:text-2xl">Your Appointments</h2>
        <div className="overflow-x-auto mt-6">
          <table className="table table-zebra w-full text-sm md:text-base">
            <thead>
              <tr>
                <th>{isDoctor ? "Patient" : "Doctor"}</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Status</th>
                {!isDoctor && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    {isDoctor ? (
                      appointment.patientName || "N/A"
                    ) : (
                      <a
                        href={`/dashboard/doctor/${appointment.doctorId}`}
                        className="text-orange-500 underline hover:text-orange-700"
                      >
                        {appointment.doctorName}
                      </a>
                    )}
                  </td>
                  <td>{appointment.appointmentType}</td>
                  <td>{appointment.preferredDate}</td>
                  <td>{appointment.preferredTime}</td>
                  <td>{appointment.notes}</td>
                  <td>
                    {isCompleted(appointment.preferredDate, appointment.preferredTime) ? (
                      <span className="text-gray-500 font-bold">Completed</span>
                    ) : appointment.isPaid ? (
                      <span className="text-green-500 font-bold">Paid</span>
                    ) : (
                      <span className="text-red-500 font-bold">Unpaid</span>
                    )}
                  </td>
                  {!isDoctor && (
                    <td>
                      {isCompleted(appointment.preferredDate, appointment.preferredTime) ? (
                        <span className="text-gray-500">No Actions</span>
                      ) : appointment.isPaid ? (
                        <button
                          className="btn btn-accent btn-sm md:btn-md font-sans font-light"
                          onClick={() => handleJoinCall(appointment.id)}
                        >
                          Join Now
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm md:btn-md font-sans font-light"
                          onClick={() => handlePayNow(appointment.id)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
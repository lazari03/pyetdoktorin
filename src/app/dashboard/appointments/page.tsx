"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useFetchAppointments } from "../../../hooks/useFetchAppointments";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import DashboardNotifications from '../../components/DashboardNotifications';
import Loader from '../../components/Loader';
import { getFirestore, doc, updateDoc } from "firebase/firestore";

const db = getFirestore();

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const { appointments, isDoctor, setAppointmentPaid, handlePayNow, isPastAppointment, checkIfPastAppointment, isAppointmentPast } = useAppointmentStore();
  const [loading, setLoading] = useState(true);
  const [pastAppointments, setPastAppointments] = useState<Record<string, boolean>>({});

  // Custom hook to handle fetching appointments and user role
  useFetchAppointments(user);

  useEffect(() => {
    const initializePage = async () => {
      try {
        const checkPaymentStatus = async () => {
          const sessionId = new URLSearchParams(window.location.search).get("session_id"); // Use window.location for client-side
          if (sessionId) {
            try {
              const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
              if (!response.ok) {
                throw new Error("Failed to verify payment");
              }

              const { appointmentId } = await response.json();

              // Update local state
              setAppointmentPaid(appointmentId);

              // Update Firebase
              await fetch(`/api/appointments/update-status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ appointmentId, isPaid: true }),
              });
            } catch (error) {
              console.error("Error verifying payment:", error);
            }
          }
        };

        await checkPaymentStatus();
      } catch (error) {
        console.error('Error initializing appointments page:', error);
      } finally {
        setLoading(false);
      }
    };

    initializePage();
  }, [setAppointmentPaid]);

  useEffect(() => {
    const fetchPastAppointments = async () => {
      const results: Record<string, boolean> = {};
      for (const appointment of appointments) {
        try {
          const isPast = await checkIfPastAppointment(appointment.id);
          console.log(`Appointment ID: ${appointment.id}, Is Past: ${isPast}`); // Debugging log
          results[appointment.id] = isPast;
        } catch (error) {
          console.error(`Error checking if appointment ${appointment.id} is in the past:`, error);
        }
      }
      setPastAppointments(results);
    };

    fetchPastAppointments();
  }, [appointments, checkIfPastAppointment]);

  const handleJoinCall = async (appointmentId: string) => {
    try {
      console.log("Creating video call session for appointmentId:", appointmentId);
  
      const response = await fetch(`/api/video-call/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response error:", errorText);
  
        if (response.status === 404) {
          alert("Video session not found. Please contact support.");
        }
  
        throw new Error("Failed to create video call session");
      }
  
      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl; // Redirect to the video call session
    } catch (error) {
      console.error("Error creating video call session:", error);
      alert("An error occurred while creating the video session. Please try again later.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (isDoctor === null) {
    console.log("Determining user role...");
    return <div>Loading...</div>;
  }

  console.log("isDoctor:", isDoctor, "user.id:", user?.uid);

  return (
    <div>
      {isDoctor && user?.uid && (
        <DashboardNotifications doctorId={user.uid} />
      )}
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
                  <th>Actions</th>
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
                      {appointment.status === "accepted" ? (
                        <span className="text-green-500 font-bold">Accepted</span>
                      ) : appointment.status === "rejected" ? (
                        <span className="text-red-500 font-bold">Declined</span>
                      ) : (
                        <span className="text-gray-500 font-bold">Pending</span>
                      )}
                    </td>
                    <td>
                      {isAppointmentPast(appointment) ? (
                        <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full">
                          Finished
                        </button>
                      ) : appointment.isPaid ? (
                        <button
                          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                          onClick={() => handleJoinCall(appointment.id)}
                        >
                          Join Now
                        </button>
                      ) : (
                        <button
                          className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
                          onClick={() => handlePayNow(appointment.id, 2100)}
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
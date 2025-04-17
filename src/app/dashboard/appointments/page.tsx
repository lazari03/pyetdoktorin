"use client";

import { useEffect } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useFetchAppointments } from "../../../hooks/useFetchAppointments";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useRouter } from "next/navigation"; // Update import to use next/navigation
import DashboardNotifications from '../../components/DashboardNotifications';

export default function AppointmentsPage() {
  const { user } = useContext(AuthContext);
  const { appointments, isDoctor, setAppointmentPaid } = useAppointmentStore();
  const router = useRouter(); // Ensure this is from next/navigation

  // Custom hook to handle fetching appointments and user role
  useFetchAppointments(user);

  useEffect(() => {
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

    checkPaymentStatus();
  }, [setAppointmentPaid]);

  const handlePayNow = async (appointmentId: string) => {
    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId, amount: 2100 }), // Replace 2100 with the actual amount in cents
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const { url } = await response.json();
      window.location.href = url; // Redirect to Stripe payment page
    } catch (error) {
      console.error("Error redirecting to Stripe payment page:", error);
    }
  };

  const handleJoinCall = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/video-call/create-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create video call session");
      }

      const { sessionUrl } = await response.json();
      window.location.href = sessionUrl; // Redirect to the video call session
    } catch (error) {
      console.error("Error creating video call session:", error);
    }
  };

  const isCompleted = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`);
    return appointmentDateTime < new Date();
  };

  if (isDoctor === null) {
    console.log("Determining user role...");
    return <div>Loading...</div>;
  }

  console.log("isDoctor:", isDoctor, "user.id:", user?.id);

  return (
    <div>
      {isDoctor && user?.id && (
        <DashboardNotifications doctorId={user.id} />
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
                          <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full">Finished</button>
                        ) : appointment.isPaid ? (
                          <button
                            className=" bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                            onClick={() => handleJoinCall(appointment.id)}
                          >
                            Join Now
                          </button>
                        ) : (
                          <button className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"

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
    </div>
  );
}
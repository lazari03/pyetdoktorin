"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useFetchAppointments } from "../../../hooks/useFetchAppointments";
import { useAuth } from "../../../context/AuthContext";
import DashboardNotifications from '../../components/DashboardNotifications';
import Loader from '../../components/Loader';
import { useVideoStore } from "../../../store/videoStore";
import RoleGuard from '../../components/RoleGuard';

function useCleanupMediaStreamsOnMount() {
  useEffect(() => {
    // Stop all tracks from any video/audio elements
    document.querySelectorAll('video, audio').forEach((el: any) => {
      if (el.srcObject) {
        (el.srcObject as MediaStream).getTracks().forEach((track: MediaStreamTrack) => {
          if (track.readyState === 'live') {
            track.stop();
          }
        });
        el.srcObject = null;
      }
    });
    // Remove unnecessary getUserMedia calls
    // Removed navigator.mediaDevices.getUserMedia cleanup logic
  }, []);
}

function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth(); // Use the hook here
  const { appointments, isDoctor, setAppointmentPaid, handlePayNow, checkIfPastAppointment, isAppointmentPast } = useAppointmentStore();
  // Use the video store directly
  const { joinCall, setAuthStatus } = useVideoStore();
  const [loading, setLoading] = useState(true);

  // Custom hook to handle fetching appointments and user role
  const { refetch } = useFetchAppointments(user);

  // Sync auth state with video store whenever auth context changes
  useEffect(() => {
    setAuthStatus(
      isAuthenticated, 
      user?.uid || null, 
      user?.name || null
    );
  }, [isAuthenticated, user, setAuthStatus]);

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

              // Refetch appointments to update UI
              setLoading(true);
              await refetch();
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
  }, [setAppointmentPaid, refetch]);

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
    };

    fetchPastAppointments();
  }, [appointments, checkIfPastAppointment]);

  const handleJoinCall = async (appointmentId: string) => {
    try {
      console.log("Creating video call session for appointmentId:", appointmentId);
      
      // Use the video store to join the call
      const videoSessionUrl = await joinCall(appointmentId, 0);
      console.log("Redirecting to video session URL:", videoSessionUrl);
      window.location.href = videoSessionUrl;
    } catch (error) {
      console.error("Error creating video call session:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Sort appointments from latest to oldest before rendering
  const sortedAppointments = [...appointments].sort((a, b) => {
    // First try to sort by date
    const dateA = new Date(a.preferredDate).getTime();
    const dateB = new Date(b.preferredDate).getTime();
    
    if (dateA !== dateB) {
      return dateB - dateA; // Latest date first
    }
    
    // If dates are the same, try to sort by creation time
    const createdAtA = new Date(a.createdAt).getTime();
    const createdAtB = new Date(b.createdAt).getTime();
    
    return createdAtB - createdAtA; // Latest creation time first
  });

  // Use the cleanup hook so it runs on mount
  useCleanupMediaStreamsOnMount();

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
                {sortedAppointments.map((appointment) => (
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
                      {isDoctor ? (
                        // Doctor: Only "Finished" or "Join Now"
                        (() => {
                          if (isAppointmentPast && isAppointmentPast(appointment)) {
                            return (
                              <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                Finished
                              </button>
                            );
                          }
                          if (appointment.status === "accepted") {
                            return (
                              <button
                                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                                onClick={() => handleJoinCall(appointment.id)}
                              >
                                Join Now
                              </button>
                            );
                          }
                          // If not accepted or in the past, show disabled button
                          return (
                            <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Action
                            </button>
                          );
                        })()
                      ) : (
                        // Patient: Existing logic
                        (() => {
                          if (isAppointmentPast && isAppointmentPast(appointment)) {
                            return (
                              <button className="bg-gray-500 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                Finished
                              </button>
                            );
                          }
                          if (appointment.status === "rejected") {
                            return (
                              <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                Declined
                              </button>
                            );
                          }
                          if (appointment.status === "pending") {
                            return (
                              <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                                Pending
                              </button>
                            );
                          }
                          if (appointment.status === "accepted" && !appointment.isPaid) {
                            return (
                              <button
                                className="bg-transparent hover:bg-orange-500 text-orange-700 font-semibold hover:text-white py-2 px-4 border border-orange-500 hover:border-transparent rounded-full"
                                onClick={() => handlePayNow(appointment.id, 2100)}
                              >
                                Pay Now
                              </button>
                            );
                          }
                          if (appointment.status === "accepted" && appointment.isPaid) {
                            return (
                              <button
                                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded-full"
                                onClick={() => handleJoinCall(appointment.id)}
                              >
                                Join Now
                              </button>
                            );
                          }
                          // Default: disabled
                          return (
                            <button className="bg-gray-400 text-white font-bold py-2 px-4 rounded opacity-50 cursor-not-allowed rounded-full" disabled>
                              Action
                            </button>
                          );
                        })()
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

// Wrap export with RoleGuard if needed
export default function ProtectedAppointmentsPage() {
  return (
    <RoleGuard allowedRoles={['doctor', 'patient']}>
      <AppointmentsPage />
    </RoleGuard>
  );
}
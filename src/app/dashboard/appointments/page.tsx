"use client";

import { useEffect, useState } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useFetchAppointments } from "../../../hooks/useFetchAppointments";
import { useAuth } from "../../../context/AuthContext";
import DashboardNotifications from '../../components/DashboardNotifications';
import Loader from '../../components/Loader';
import { useVideoStore } from "../../../store/videoStore";
import RoleGuard from '../../components/RoleGuard';
import { cleanupMediaStreams } from "../../../utils/mediaUtils"; // Use the utility function
import { AppointmentsTable } from '../../components/SharedAppointmentsTable';

function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const { appointments, isDoctor, setAppointmentPaid, handlePayNow, checkIfPastAppointment, isAppointmentPast } = useAppointmentStore();
  const { joinCall, setAuthStatus } = useVideoStore();
  const [loading, setLoading] = useState(true);

  const { refetch } = useFetchAppointments(user);

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
          const sessionId = new URLSearchParams(window.location.search).get("session_id");
          if (sessionId) {
            try {
              const response = await fetch(`/api/stripe/verify-payment?session_id=${sessionId}`);
              if (!response.ok) {
                throw new Error("Failed to verify payment");
              }

              const { appointmentId } = await response.json();
              setAppointmentPaid(appointmentId);

              await fetch(`/api/appointments/update-status`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ appointmentId, isPaid: true }),
              });

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
          console.log(`Appointment ID: ${appointment.id}, Is Past: ${isPast}`);
          results[appointment.id] = isPast;
        } catch (error) {
          console.error(`Error checking if appointment ${appointment.id} is in the past:`, error);
        }
      }
    };

    fetchPastAppointments();
  }, [appointments, checkIfPastAppointment]);

  useEffect(() => {
    cleanupMediaStreams(); // Use the utility function for cleanup
  }, []);

  const handleJoinCall = async (appointmentId: string) => {
    try {
      console.log("Creating video call session for appointmentId:", appointmentId);
      const videoSessionUrl = await joinCall(appointmentId, 0);
      console.log("Redirecting to video session URL:", videoSessionUrl);
      window.location.href = videoSessionUrl;
    } catch (error) {
      console.error("Error creating video call session:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.preferredDate).getTime();
    const dateB = new Date(b.preferredDate).getTime();
    if (dateA !== dateB) {
      return dateB - dateA;
    }
    const createdAtA = new Date(a.createdAt).getTime();
    const createdAtB = new Date(b.createdAt).getTime();
    return createdAtB - createdAtA;
  });

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
          <AppointmentsTable
            appointments={appointments}
            role={isDoctor ? 'doctor' : 'patient'}
            isAppointmentPast={isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={handlePayNow}
            showActions={true}
            maxRows={100}
          />
        </div>
      </div>
    </div>
  );
}

export default function ProtectedAppointmentsPage() {
  return (
    <RoleGuard allowedRoles={['doctor', 'patient']}>
      <AppointmentsPage />
    </RoleGuard>
  );
}
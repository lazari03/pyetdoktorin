"use client";

import { useEffect } from "react";
import { useAppointmentStore } from "../../../store/appointmentStore";
import { useAuth } from "../../../context/AuthContext";
import DashboardNotifications from '../../components/DashboardNotifications';
import Loader from "../../components/Loader";
import { useVideoStore } from "../../../store/videoStore";
import RoleGuard from '../../components/RoleGuard';
import { AppointmentsTable } from '../../components/SharedAppointmentsTable';
import { getUserRole } from '../../../services/appointmentsService';
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from '../../../config/userRoles';

function AppointmentsPage() {
  const { user, isAuthenticated } = useAuth();
  const { appointments, isDoctor, setAppointmentPaid, handlePayNow, checkIfPastAppointment, isAppointmentPast, fetchAppointments, loading, setIsDoctor } = useAppointmentStore();
  const { joinCall, setAuthStatus } = useVideoStore();

  useEffect(() => {
    setAuthStatus(
      isAuthenticated, 
      user?.uid || null, 
      user?.name || null
    );
  }, [isAuthenticated, user, setAuthStatus]);

  useEffect(() => {
    const checkAndSetRole = async () => {
      if (user?.uid) {
        const role = await getUserRole(user.uid);
        setIsDoctor(role === USER_ROLE_DOCTOR);
      }
    };
    checkAndSetRole();
  }, [user, setIsDoctor]);

  useEffect(() => {
    if (!user?.uid || typeof isDoctor !== 'boolean') return;
    fetchAppointments(user.uid, isDoctor);
  }, [user, isDoctor, fetchAppointments]);

  useEffect(() => {
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
          if (user?.uid && typeof isDoctor === 'boolean') {
            await fetchAppointments(user.uid, isDoctor);
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      }
    };
    checkPaymentStatus();
  }, [setAppointmentPaid, user, isDoctor, fetchAppointments]);

  const handleJoinCall = async (appointmentId: string) => {
    try {
      const videoSessionUrl = await joinCall(appointmentId, 0);
      window.location.href = videoSessionUrl;
    } catch (error) {
      console.error("Error creating video call session:", error);
      alert(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (typeof isDoctor !== 'boolean') {
    return <div>Loading...</div>;
  }

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
            role={isDoctor ? USER_ROLE_DOCTOR : USER_ROLE_PATIENT}
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
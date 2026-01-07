"use client";

import { useEffect, useState } from "react";
import RedirectingModal from '@/app/components/RedirectingModal';
import { useAppointmentStore } from '@/store/appointmentStore';
import { getAppointments } from '@/domain/appointmentService';
import { useAuth } from '@/context/AuthContext';
import { useVideoStore } from '@/store/videoStore';
import RoleGuard from '@/app/components/RoleGuard';
import { AppointmentsTable } from '@/app/components/appointment/SharedAppointmentsTable';
import { appointmentRepository } from '@/infrastructure/appointmentRepository';
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from '@/config/userRoles';


function AppointmentsPage() {
  const [showRedirecting, setShowRedirecting] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const {
    appointments,
    isDoctor,
    handlePayNow,
    isAppointmentPast,
    fetchAppointments,
    verifyAndUpdatePayment,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();

  // Sync auth status with store
  useEffect(() => {
    setAuthStatus(isAuthenticated, user?.uid || null, user?.name || null);
  }, [isAuthenticated, user, setAuthStatus]);

  // Set doctor/patient role
  useEffect(() => {
    if (!user?.uid) return;
    // Use domain/application layer to fetch user role
    // Example: import { fetchUserRoleUseCase } from '@/application/fetchUserRoleUseCase';
    // fetchUserRoleUseCase(user.uid).then(role => { /* update store or local state */ });
    // For now, remove direct store call
  }, [user]);

  // Fetch appointments on user/role change
  useEffect(() => {
    if (!user?.uid || typeof isDoctor !== 'boolean') return;
    fetchAppointments(user.uid, isDoctor, getAppointments);
  }, [user, isDoctor, fetchAppointments]);

  // Check payment status on mount
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    if (!sessionId) return;
    (async () => {
      try {
        if (user?.uid && typeof isDoctor === 'boolean') {
          await verifyAndUpdatePayment(sessionId, user.uid, isDoctor, getAppointments);
        }
      } catch {
        // Optionally handle error
      }
    })();
  }, [verifyAndUpdatePayment, user, isDoctor]);

  // Join call handler
  const handleJoinCall = async (appointmentId: string) => {
    try {
      setShowRedirecting(true);
      setAuthStatus(!!user, user?.uid || null, user?.name || null);
      if (!user?.uid) {
        setShowRedirecting(false);
        alert('You must be logged in to join a call. Please log in and try again.');
        return;
      }
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) throw new Error('Appointment not found');
      const patientName = appointment.patientName || user.name || 'Guest';
      const role = isDoctor ? 'doctor' : 'patient';
      let roomCode = appointment.roomCode;
      let roomId = appointment.roomId;
      // If missing, generate and update
      if (!roomCode || !roomId) {
        const { generateRoomCodeAndToken } = await import('@/domain/100msService');
        const data = await generateRoomCodeAndToken({
          user_id: user.uid,
          room_id: appointmentId,
          role,
        });
        roomCode = data.roomCode;
        roomId = data.room_id;
        // Update appointment in Firestore
        if (roomCode && roomId) {
          await appointmentRepository.update(appointmentId, { roomCode, roomId });
        }
      }
      if (!roomCode) throw new Error('No roomCode available');
      window.localStorage.setItem('videoSessionRoomCode', roomCode);
      window.localStorage.setItem('videoSessionUserName', patientName);
      window.location.href = '/dashboard/appointments/video-session';
    } catch {
      setShowRedirecting(false);
      alert('An error occurred. Please try again.');
    }
  };

  // Loader is now handled by RoleGuard, so no need to show it here

  return (
    <div className="min-h-screen bg-transparent">
      <RedirectingModal show={showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        {/* Header aligned with dashboard style */}
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900">
            Your Appointments
          </h2>
        </header>

        {/* Table card matching new dashboard UI */}
        <section className="dashboard-table-card">
          <div className="px-4 sm:px-6 pt-4 pb-4">
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
        </section>
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
"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppointmentStore } from "@/store/appointmentStore";
import { getAppointments } from "@/domain/appointmentService";
import { useAuth } from "@/context/AuthContext";
import { useVideoStore } from "@/store/videoStore";
import { appointmentRepository } from "@/infrastructure/appointmentRepository";
import { Appointment } from "@/domain/entities/Appointment";
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from "@/config/userRoles";

/**
 * View model result interface for appointments page
 */
export interface AppointmentsViewModelResult {
  // Data
  appointments: Appointment[];
  userRole: typeof USER_ROLE_DOCTOR | typeof USER_ROLE_PATIENT;

  // UI State
  showRedirecting: boolean;

  // Helpers
  isAppointmentPast: (appointment: Appointment) => boolean;

  // Actions
  handleJoinCall: (appointmentId: string) => Promise<void>;
  handlePayNow: (appointmentId: string, amount: number) => Promise<void>;
}

/**
 * Appointments View Model
 *
 * Separates all business logic from the appointments page component.
 * The page only needs to render UI based on the values returned here.
 */
export function useAppointmentsViewModel(): AppointmentsViewModelResult {
  const [showRedirecting, setShowRedirecting] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const {
    appointments,
    isDoctor,
    handlePayNow: storeHandlePayNow,
    isAppointmentPast,
    fetchAppointments,
    verifyAndUpdatePayment,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();

  // Sync auth status with video store
  useEffect(() => {
    setAuthStatus(isAuthenticated, user?.uid || null, user?.name || null);
  }, [isAuthenticated, user, setAuthStatus]);

  // Fetch appointments when user/role changes
  useEffect(() => {
    if (!user?.uid || typeof isDoctor !== "boolean") return;
    fetchAppointments(user.uid, isDoctor, getAppointments);
  }, [user, isDoctor, fetchAppointments]);

  // Check payment status on mount (from URL params)
  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;

    (async () => {
      try {
        if (user?.uid && typeof isDoctor === "boolean") {
          await verifyAndUpdatePayment(sessionId, user.uid, isDoctor, getAppointments);
        }
      } catch {
        // Payment verification failed silently
      }
    })();
  }, [verifyAndUpdatePayment, user, isDoctor]);

  // Join video call handler
  const handleJoinCall = useCallback(
    async (appointmentId: string) => {
      try {
        setShowRedirecting(true);
        setAuthStatus(!!user, user?.uid || null, user?.name || null);

        if (!user?.uid) {
          setShowRedirecting(false);
          alert("You must be logged in to join a call. Please log in and try again.");
          return;
        }

        const appointment = appointments.find((a) => a.id === appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        const patientName = appointment.patientName || user.name || "Guest";
        const role = isDoctor ? "doctor" : "patient";
        let roomCode = appointment.roomCode;
        let roomId = appointment.roomId;

        // Generate room code if missing
        if (!roomCode || !roomId) {
          const { generateRoomCodeAndToken } = await import("@/domain/100msService");
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

        if (!roomCode) throw new Error("No roomCode available");

        // Store session data and redirect
        window.localStorage.setItem("videoSessionRoomCode", roomCode);
        window.localStorage.setItem("videoSessionUserName", patientName);
        window.location.href = "/dashboard/appointments/video-session";
      } catch {
        setShowRedirecting(false);
        alert("An error occurred. Please try again.");
      }
    },
    [user, appointments, isDoctor, setAuthStatus]
  );

  // Derive user role for table component
  const userRole = isDoctor ? USER_ROLE_DOCTOR : USER_ROLE_PATIENT;

  return {
    // Data
    appointments,
    userRole,

    // UI State
    showRedirecting,

    // Helpers
    isAppointmentPast,

    // Actions
    handleJoinCall,
    handlePayNow: storeHandlePayNow,
  };
}

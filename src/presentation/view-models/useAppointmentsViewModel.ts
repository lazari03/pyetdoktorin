"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAuth } from "@/context/AuthContext";
import { useVideoStore } from "@/store/videoStore";
import { useDI } from "@/context/DIContext";
import { Appointment } from "@/domain/entities/Appointment";
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from "@/config/userRoles";
import { useTranslation } from "react-i18next";
import { auth } from "@/config/firebaseconfig";

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
  const { t } = useTranslation();

  const { user, isAuthenticated } = useAuth();
  const {
    appointments,
    isDoctor,
    isAppointmentPast,
    fetchAppointments,
    handlePayNow: storeHandlePayNow,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();
  const {
    getAppointmentsUseCase,
    updateAppointmentUseCase,
    generateRoomCodeUseCase,
    handlePayNowUseCase,
  } = useDI();

  // Sync auth status with video store
  useEffect(() => {
    setAuthStatus(isAuthenticated, user?.uid || null, user?.name || null);
  }, [isAuthenticated, user, setAuthStatus]);

  // Fetch appointments when user/role changes
  useEffect(() => {
    if (!user?.uid || typeof isDoctor !== "boolean") return;
    fetchAppointments(user.uid, isDoctor, getAppointmentsUseCase.execute.bind(getAppointmentsUseCase));
  }, [user, isDoctor, fetchAppointments, getAppointmentsUseCase]);

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

        if (!isDoctor && !appointment.isPaid) {
          setShowRedirecting(false);
          alert(t("paymentRequired"));
          return;
        }

        const role = isDoctor ? "doctor" : "patient";
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setShowRedirecting(false);
          alert(t("sessionExpired") || "Your session has expired. Please log in again.");
          return;
        }
        const idToken = await currentUser.getIdToken();

        const data = await generateRoomCodeUseCase.execute({
          user_id: user.uid,
          room_id: appointmentId,
          role,
          idToken,
        });

        const roomCode = data.roomCode || appointment.roomCode;
        const roomId = data.room_id || appointment.roomId;
        const sessionToken = data.sessionToken;

        if (!roomCode || !sessionToken) {
          throw new Error("Missing room information from server");
        }

        if ((!appointment.roomCode || !appointment.roomId) && roomCode && roomId) {
          await updateAppointmentUseCase.execute(appointmentId, { roomCode, roomId });
        }

        const joinUrl = `/dashboard/appointments/video-session?session=${encodeURIComponent(sessionToken)}`;
        window.location.href = joinUrl;
      } catch {
        setShowRedirecting(false);
        alert("An error occurred. Please try again.");
      }
    },
    [appointments, generateRoomCodeUseCase, isDoctor, setAuthStatus, t, updateAppointmentUseCase, user]
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
    handlePayNow: (appointmentId, amount) =>
      storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase)),
  };
}

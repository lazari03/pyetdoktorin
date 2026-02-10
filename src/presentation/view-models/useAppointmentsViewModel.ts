"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAuth } from "@/context/AuthContext";
import { useVideoStore } from "@/store/videoStore";
import { useDI } from "@/context/DIContext";
import { Appointment } from "@/domain/entities/Appointment";
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from "@/config/userRoles";
import { useTranslation } from "react-i18next";
import { auth } from "@/config/firebaseconfig";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";

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
  const searchParams = useSearchParams();

  const { user, isAuthenticated, role } = useAuth();
  const {
    appointments,
    isDoctor,
    isAppointmentPast,
    fetchAppointments,
    optimisticMarkPaid,
    optimisticPaidIds,
    handlePayNow: storeHandlePayNow,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();
  const {
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
    if (!role) return;
    fetchAppointments(role);
  }, [role, fetchAppointments]);

  // For doctors, poll to pick up payment status changes from patients.
  useEffect(() => {
    if (!isDoctor || !role) return;
    const hasPendingPayment = appointments.some(
      (appointment) => appointment.status === "accepted" && !appointment.isPaid
    );
    if (!hasPendingPayment) return;

    let cancelled = false;
    const timer = setInterval(() => {
      if (cancelled) return;
      fetchAppointments(role);
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [appointments, fetchAppointments, isDoctor, role]);

  const appointmentsRef = useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Refresh appointments after payment return so isPaid updates
  useEffect(() => {
    if (!role) return;
    const fromQuery = searchParams?.get("paid");
    let paidId = fromQuery;
    if (!paidId && typeof window !== "undefined") {
      try {
        const startedAt = Number(window.sessionStorage.getItem("pendingPaidStartedAt") || "0");
        const isFresh = startedAt > 0 && Date.now() - startedAt < 10 * 60 * 1000;
        const storedId = window.sessionStorage.getItem("pendingPaidAppointmentId");
        if (isFresh && storedId) paidId = storedId;
      } catch {
        // ignore storage failures
      }
    }
    if (!paidId) return;
    optimisticMarkPaid(paidId);
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;
    const pollIntervalMs = 1000;

    const poll = async () => {
      if (cancelled) return;
      attempts += 1;
      await fetchAppointments(role);
      if (cancelled) return;
      const isPaid = appointmentsRef.current.some(
        (appointment) => appointment.id === paidId && appointment.isPaid
      );
      if (isPaid || attempts >= maxAttempts) {
        if (timer) clearInterval(timer);
      }
      if (isPaid && typeof window !== "undefined") {
        try {
          window.sessionStorage.removeItem("pendingPaidAppointmentId");
          window.sessionStorage.removeItem("pendingPaidStartedAt");
        } catch {
          // ignore storage failures
        }
      }
    };

    poll();
    const timer = setInterval(poll, pollIntervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [fetchAppointments, optimisticMarkPaid, role, searchParams]);

  // Join video call handler
  const handleJoinCall = useCallback(
    async (appointmentId: string) => {
      try {
        trackAnalyticsEvent("appointment_join_attempt", {
          appointmentId,
          role: isDoctor ? "doctor" : "patient",
        });
        setShowRedirecting(true);
        setAuthStatus(!!user, user?.uid || null, user?.name || null);

        if (!user?.uid) {
          setShowRedirecting(false);
          trackAnalyticsEvent("appointment_join_blocked", {
            appointmentId,
            reason: "unauthenticated",
          });
          alert("You must be logged in to join a call. Please log in and try again.");
          return;
        }

        if (role) {
          await fetchAppointments(role);
        }
        const freshAppointment = appointmentsRef.current.find((a) => a.id === appointmentId);
        const appointment = freshAppointment ?? appointments.find((a) => a.id === appointmentId);
        if (!appointment) throw new Error("Appointment not found");

        if (!isDoctor && !appointment.isPaid) {
          setShowRedirecting(false);
          const pendingFromStorage =
            typeof window !== "undefined" &&
            window.sessionStorage.getItem("pendingPaidAppointmentId") === appointmentId;
          const isPending = Boolean(optimisticPaidIds?.[appointmentId]) || pendingFromStorage;
          trackAnalyticsEvent("appointment_join_blocked", {
            appointmentId,
            reason: isPending ? "payment_processing" : "payment_required",
          });
          alert(isPending ? t("paymentProcessing") : t("paymentRequired"));
          return;
        }
        if (!isDoctor) {
          const status = (appointment.status || "").toString().toLowerCase();
          if (status !== "accepted") {
            setShowRedirecting(false);
            trackAnalyticsEvent("appointment_join_blocked", {
              appointmentId,
              reason: "waiting_for_acceptance",
            });
            alert(t("waitingForAcceptance"));
            return;
          }
        }

        const sessionRole = isDoctor ? "doctor" : "patient";
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
          role: sessionRole,
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
        trackAnalyticsEvent("appointment_join_success", {
          appointmentId,
          role: sessionRole,
        });
        window.location.href = joinUrl;
      } catch (error) {
        setShowRedirecting(false);
        const message = error instanceof Error ? error.message : "An error occurred. Please try again.";
        trackAnalyticsEvent("appointment_join_failed", {
          appointmentId,
          reason: message.slice(0, 120),
        });
        alert(message);
      }
    },
    [
      appointments,
      fetchAppointments,
      generateRoomCodeUseCase,
      isDoctor,
      optimisticPaidIds,
      role,
      setAuthStatus,
      t,
      updateAppointmentUseCase,
      user,
    ]
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
    handlePayNow: (appointmentId, amount) => {
      trackAnalyticsEvent("payment_initiated", {
        appointmentId,
        amount,
      });
      return storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase));
    },
  };
}

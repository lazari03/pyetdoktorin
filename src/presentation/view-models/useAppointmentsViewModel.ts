"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAuth } from "@/context/AuthContext";
import { useVideoStore } from "@/store/videoStore";
import { useDI } from "@/context/DIContext";
import { Appointment } from "@/domain/entities/Appointment";
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from "@/config/userRoles";
import { useTranslation } from "react-i18next";
import { getAuthToken } from "@/application/auth/tokenHolder";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { getAppointmentErrorMessage, getVideoErrorMessage } from "@/presentation/utils/errorMessages";
import { APPOINTMENT_ERROR_CODES, VIDEO_ERROR_CODES } from "@/config/errorCodes";
import { dashboardVideoSessionUrl, dashboardPayUrl } from "@/navigation/paths";
import { useToast } from "@/presentation/components/Toast/ToastProvider";

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
  const { toast } = useToast();
  const router = useRouter();

  const { user, isAuthenticated, role } = useAuth();
  const {
    appointments,
    isDoctor,
    isAppointmentPast,
    subscribeAppointments,
  } = useAppointmentStore();
  const { setAuthStatus } = useVideoStore();
  const {
    generateRoomCodeUseCase,
    paymentSyncService,
    appointmentQueryService,
  } = useDI();

  // Sync auth status with video store
  useEffect(() => {
    setAuthStatus(isAuthenticated, user?.uid || null, user?.name || null);
    // `user` is a new object literal every AuthContext render (not memoized there),
    // and setAuthStatus's set() has no equality guard — depending on the whole
    // object here re-fires this effect (and the store update) on every render,
    // which can cascade into a render loop. Depend on the primitive fields instead.
  }, [isAuthenticated, user?.uid, user?.name, setAuthStatus]);

  // Subscribe to appointments for real-time updates
  useEffect(() => {
    if (!role || !user?.uid) return;
    const unsubscribe = subscribeAppointments(user.uid, role);
    return () => unsubscribe();
  }, [role, subscribeAppointments, user?.uid]);

  const appointmentsRef = useRef(appointments);
  useEffect(() => {
    appointmentsRef.current = appointments;
  }, [appointments]);

  // Join video call handler
  const handleJoinCall = useCallback(
    async (appointmentId: string) => {
      try {
        // Block joining past appointments
        const targetAppointment = appointments.find((a) => a.id === appointmentId);
        if (targetAppointment && isAppointmentPast(targetAppointment)) {
          trackAnalyticsEvent("appointment_join_blocked", {
            appointmentId,
            reason: "appointment_past",
          });
          toast({ variant: "error", message: t("appointmentPast") });
          return;
        }

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
          toast({ variant: "error", message: t("joinCallLoginRequired") });
          return;
        }

        const freshAppointment = appointmentsRef.current.find((a) => a.id === appointmentId);
        let appointment = freshAppointment ?? appointments.find((a) => a.id === appointmentId);
        if (!appointment) throw new Error(APPOINTMENT_ERROR_CODES.NotFound);

        if (!isDoctor && !appointment.isPaid) {
          try {
            await paymentSyncService.syncPayment(appointmentId);
            const response = await appointmentQueryService.listAppointments();
            const refreshed = response.items.find((a) => a.id === appointmentId);
            if (refreshed) appointment = refreshed;
          } catch (syncError) {
            console.warn("Payment sync failed", syncError);
          }
        }

        if (!isDoctor && !appointment.isPaid) {
          setShowRedirecting(false);
          trackAnalyticsEvent("appointment_join_blocked", {
            appointmentId,
            reason: "payment_required",
          });
          toast({ variant: "error", message: t("paymentRequired") });
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
            toast({ variant: "info", message: t("waitingForAcceptance") });
            return;
          }
        }

        const sessionRole = isDoctor ? "doctor" : "patient";
        const idToken = getAuthToken();
        if (!idToken) {
          setShowRedirecting(false);
          toast({ variant: "error", message: t("sessionExpired") });
          return;
        }

        const data = await generateRoomCodeUseCase.execute({
          user_id: user.uid,
          room_id: appointmentId,
          role: sessionRole,
          idToken,
        });

        const roomCode = data.roomCode || appointment.roomCode;
        const sessionToken = data.sessionToken;

        if (!roomCode || !sessionToken) {
          throw new Error(VIDEO_ERROR_CODES.GenericFailed);
        }

        const joinUrl = dashboardVideoSessionUrl(sessionToken);
        trackAnalyticsEvent("appointment_join_success", {
          appointmentId,
          role: sessionRole,
        });
        window.location.href = joinUrl;
      } catch (error) {
        setShowRedirecting(false);
        const translatedMessage =
          getVideoErrorMessage(error, t) ?? getAppointmentErrorMessage(error, t);
        const message = translatedMessage ?? t("genericError");
        trackAnalyticsEvent("appointment_join_failed", {
          appointmentId,
          reason: message.slice(0, 120),
        });
        toast({ variant: "error", message });
      }
    },
    [
      appointments,
      generateRoomCodeUseCase,
      isDoctor,
      isAppointmentPast,
      setAuthStatus,
      t,
      user,
      toast,
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
    handlePayNow: async (appointmentId, amount) => {
      trackAnalyticsEvent("payment_initiated", { appointmentId, amount });
      router.push(dashboardPayUrl(appointmentId));
    },
  };
}

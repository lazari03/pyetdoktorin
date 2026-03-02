"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAuth } from "@/context/AuthContext";
import { useVideoStore } from "@/store/videoStore";
import { useDI } from "@/context/DIContext";
import { Appointment } from "@/domain/entities/Appointment";
import { USER_ROLE_DOCTOR, USER_ROLE_PATIENT } from "@/config/userRoles";
import { useTranslation } from "react-i18next";
import { auth } from "@/config/firebaseconfig";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { syncPaddlePayment, syncPaddlePaymentWithRetry } from "@/network/payments";
import { listAppointments } from "@/network/appointments";
import { clearPaymentProcessing } from "@/network/appointments";
import { getAppointmentErrorMessage, getVideoErrorMessage } from "@/presentation/utils/errorMessages";
import { APPOINTMENT_ERROR_CODES, VIDEO_ERROR_CODES } from "@/config/errorCodes";
import { dashboardVideoSessionUrl } from "@/navigation/paths";

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

  const { user, isAuthenticated, role } = useAuth();
  const {
    appointments,
    isDoctor,
    isAppointmentPast,
    handlePayNow: storeHandlePayNow,
    setAppointments,
    subscribeAppointments,
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
          alert(t("appointmentPast"));
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
          alert(t("joinCallLoginRequired"));
          return;
        }

        const freshAppointment = appointmentsRef.current.find((a) => a.id === appointmentId);
        let appointment = freshAppointment ?? appointments.find((a) => a.id === appointmentId);
        if (!appointment) throw new Error(APPOINTMENT_ERROR_CODES.NotFound);

        if (!isDoctor && !appointment.isPaid) {
          try {
            await syncPaddlePayment(appointmentId);
            const response = await listAppointments();
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
          alert(t("paymentRequired"));
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
          alert(t("sessionExpired"));
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
          throw new Error(VIDEO_ERROR_CODES.GenericFailed);
        }

        if ((!appointment.roomCode || !appointment.roomId) && roomCode && roomId) {
          await updateAppointmentUseCase.execute(appointmentId, { roomCode, roomId });
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
        alert(message);
      }
    },
    [
      appointments,
      generateRoomCodeUseCase,
      isDoctor,
      isAppointmentPast,
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
    handlePayNow: async (appointmentId, amount) => {
      trackAnalyticsEvent("payment_initiated", {
        appointmentId,
        amount,
      });
      try {
        await storeHandlePayNow(appointmentId, amount, handlePayNowUseCase.execute.bind(handlePayNowUseCase), {
          onClose: () => {
            clearPaymentProcessing(appointmentId).catch((error) => {
              console.warn("Payment processing clear failed", error);
            });
            (async () => {
              try {
                await syncPaddlePaymentWithRetry(appointmentId);
              } catch (error) {
                console.warn("Payment sync failed", error);
              } finally {
                listAppointments()
                  .then((refreshed) => setAppointments(refreshed.items))
                  .catch((error) => console.warn("Appointment refresh after payment failed", error));
              }
            })();
          },
        });
      } catch (error) {
        trackAnalyticsEvent("payment_failed", {
          appointmentId,
          reason: error instanceof Error ? error.message.slice(0, 120) : "unknown_error",
        });
        const translatedMessage = getAppointmentErrorMessage(error, t);
        alert(translatedMessage ?? t("genericError"));
      }
    },
  };
}

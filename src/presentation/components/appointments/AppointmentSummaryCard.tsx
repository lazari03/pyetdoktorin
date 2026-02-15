import React, { useState } from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction } from "@/presentation/utils/getAppointmentAction";
import { getAppointmentActionPresentation } from "@/presentation/utils/getAppointmentActionPresentation";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { toUserRole } from "@/presentation/utils/toUserRole";
import { useTranslation } from "react-i18next";
import { PhoneIcon, CreditCardIcon, ArrowsRightLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { PAYWALL_AMOUNT_USD } from "@/config/paywallConfig";
import { UserRole } from "@/domain/entities/UserRole";
import { AppointmentDetailsModal } from "@/presentation/components/appointments/AppointmentDetailsModal";

type Props = {
  appointment: Appointment;
  role: UserRole;
  isAppointmentPast: (appointment: Appointment) => boolean;
  onJoinCall: (id: string) => void;
  onPayNow: (id: string, amount: number) => void;
  onReschedule?: (id: string) => void;
};

export function AppointmentSummaryCard({
  appointment,
  role,
  isAppointmentPast,
  onJoinCall,
  onPayNow,
  onReschedule,
}: Props) {
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);
  const status = getAppointmentStatusPresentation(appointment.status);
  const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));
  const actionPresentation = getAppointmentActionPresentation(appointment, role, action);
  const waitingForAcceptance = action.label === "waitingForAcceptance";

  const handlePrimary = () => {
    if (isPast) return;
    if (actionPresentation.type === "join") return onJoinCall(appointment.id);
    if (actionPresentation.type === "pay") return onPayNow(appointment.id, PAYWALL_AMOUNT_USD);
    if (actionPresentation.type === "disabled" && onReschedule && role === UserRole.Patient) {
      return onReschedule(appointment.id);
    }
  };

  const primaryLabel = (() => {
    if (isPast) return t("completed");
    switch (actionPresentation.type) {
      case "join":
        return t(actionPresentation.label);
      case "pay":
        return t(actionPresentation.label);
      case "waiting":
      case "disabled":
        if (waitingForAcceptance) return t("waitingForAcceptance");
        return role === UserRole.Patient ? t("reschedule") : t("waitingForPayment");
      default:
        return t("seeDetails");
    }
  })();

  const primaryIcon = (() => {
    if (isPast) return <CheckCircleIcon className="h-4 w-4" />;
    switch (actionPresentation.type) {
      case "join":
        return <PhoneIcon className="h-4 w-4" />;
      case "pay":
        return <CreditCardIcon className="h-4 w-4" />;
      case "waiting":
      case "disabled":
        return <ArrowsRightLeftIcon className="h-4 w-4" />;
      default:
        return null;
    }
  })();

  const isPrimaryDisabled =
    isPast ||
    actionPresentation.type === "waiting" ||
    waitingForAcceptance ||
    (actionPresentation.type === "disabled" && role !== UserRole.Patient);

  return (
    <div className={`rounded-3xl shadow-lg border p-5 flex flex-col gap-4 transition-opacity ${
      isPast
        ? "bg-gray-50/60 border-gray-100 opacity-75"
        : "bg-white border-purple-50"
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={`text-xs uppercase tracking-[0.14em] font-semibold ${
            isPast ? "text-gray-400" : "text-purple-600"
          }`}>
            {isPast ? t("pastAppointment") : t("nextAppointment")}
          </p>
          <Link
            href={`/dashboard/doctor/${appointment.doctorId}`}
            className={`text-xl font-semibold mt-1 line-clamp-1 block hover:underline ${
              isPast ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {appointment.doctorName || t("doctor")}
          </Link>
          <p className="text-sm text-gray-600">
            {appointment.appointmentType} • {appointment.preferredDate} • {appointment.preferredTime}
          </p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} bg-opacity-10`}>
          {t(status.label)}
        </span>
      </div>

      {appointment.notes && (
        <p className="text-sm text-gray-700 bg-purple-50/60 text-left rounded-2xl px-3 py-2">
          “{appointment.notes}”
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handlePrimary}
          disabled={isPrimaryDisabled}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            isPrimaryDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {primaryIcon}
          {primaryLabel}
        </button>
        {!isPast && onReschedule && role === UserRole.Patient && (
          <button
            onClick={() => onReschedule(appointment.id)}
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ArrowsRightLeftIcon className="h-4 w-4" />
            {t("reschedule")}
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className="text-xs text-purple-600 font-semibold ml-auto hover:text-purple-700"
        >
          {t("seeDetails")}
        </button>
      </div>
      <AppointmentDetailsModal
        open={showDetails}
        appointment={appointment}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}

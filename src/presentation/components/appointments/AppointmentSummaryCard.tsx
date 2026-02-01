import React from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentAction } from "@/presentation/utils/getAppointmentAction";
import { getAppointmentActionPresentation } from "@/presentation/utils/getAppointmentActionPresentation";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { toUserRole } from "@/presentation/utils/toUserRole";
import { useTranslation } from "react-i18next";
import { PhoneIcon, CreditCardIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline";
import { PAYWALL_AMOUNT_USD } from "@/config/paywallConfig";

type Props = {
  appointment: Appointment;
  role: string;
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
  const status = getAppointmentStatusPresentation(appointment.status);
  const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));
  const actionPresentation = getAppointmentActionPresentation(appointment, role, action);

  const handlePrimary = () => {
    if (actionPresentation.type === "join") return onJoinCall(appointment.id);
    if (actionPresentation.type === "pay") return onPayNow(appointment.id, PAYWALL_AMOUNT_USD);
    if (actionPresentation.type === "disabled" && onReschedule) return onReschedule(appointment.id);
  };

  const primaryLabel = (() => {
    switch (actionPresentation.type) {
      case "join":
        return t(actionPresentation.label);
      case "pay":
        return t(actionPresentation.label);
      case "waiting":
      case "disabled":
        return t("reschedule");
      default:
        return t("seeDetails");
    }
  })();

  const primaryIcon = (() => {
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

  return (
    <div className="rounded-3xl bg-white shadow-lg border border-purple-50 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-purple-600 font-semibold">
            {t("nextAppointment")}
          </p>
          <h3 className="text-xl font-semibold text-gray-900 mt-1 line-clamp-1">
            {appointment.doctorName || t("doctor")}
          </h3>
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
          className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
        >
          {primaryIcon}
          {primaryLabel}
        </button>
        {onReschedule && (
          <button
            onClick={() => onReschedule(appointment.id)}
            className="inline-flex items-center gap-2 rounded-full border border-purple-200 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <ArrowsRightLeftIcon className="h-4 w-4" />
            {t("reschedule")}
          </button>
        )}
        <span className="text-xs text-gray-500 ml-auto">{t("seeDetails")}</span>
      </div>
    </div>
  );
}

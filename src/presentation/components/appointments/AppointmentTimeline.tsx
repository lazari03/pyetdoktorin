import React from "react";
import { Appointment } from "@/domain/entities/Appointment";
import { useTranslation } from "react-i18next";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { getAppointmentAction } from "@/presentation/utils/getAppointmentAction";
import { getAppointmentActionPresentation } from "@/presentation/utils/getAppointmentActionPresentation";
import { toUserRole } from "@/presentation/utils/toUserRole";
import { PhoneIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { PAYWALL_AMOUNT_USD } from "@/config/paywallConfig";
import { UserRole } from "@/domain/entities/UserRole";

type Props = {
  items: Appointment[];
  role: UserRole;
  isAppointmentPast: (appointment: Appointment) => boolean;
  onJoinCall: (id: string) => void;
  onPayNow: (id: string, amount: number) => void;
};

export function AppointmentTimeline({ items, role, isAppointmentPast, onJoinCall, onPayNow }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {items.map((appointment) => {
        const status = getAppointmentStatusPresentation(appointment.status);
        const action = getAppointmentAction(appointment, isAppointmentPast, toUserRole(role));
        const presentation = getAppointmentActionPresentation(appointment, role, action);

        const renderAction = () => {
          if (presentation.type === "join") {
            return (
              <button
                onClick={() => onJoinCall(appointment.id)}
                className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 transition-colors"
              >
                <PhoneIcon className="h-4 w-4" />
                {t(presentation.label)}
              </button>
            );
          }
          if (presentation.type === "pay") {
            return (
              <button
                onClick={() => onPayNow(appointment.id, PAYWALL_AMOUNT_USD)}
                className="inline-flex items-center gap-2 rounded-full border border-purple-500 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-500 hover:text-white transition-colors"
              >
                <CreditCardIcon className="h-4 w-4" />
                {t(presentation.label)}
              </button>
            );
          }
          if (presentation.type === "waiting") {
            return <span className="text-xs font-semibold text-purple-600">{t(presentation.label)}</span>;
          }
          return null;
        };

        return (
          <div
            key={appointment.id}
            className="relative rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex gap-4"
          >
            <div className="flex flex-col items-center">
              <div className="text-sm font-semibold text-purple-700">{appointment.preferredDate}</div>
              <div className="text-[11px] text-gray-500">{appointment.preferredTime}</div>
              <div className="w-px flex-1 bg-purple-100 mt-2" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {appointment.doctorName || t("doctor")}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {appointment.appointmentType}
                  </p>
                </div>
                <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${status.color} bg-opacity-10`}>
                  {t(status.label)}
                </span>
              </div>
              {appointment.notes && (
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{appointment.notes}</p>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                {renderAction()}
                <a href={`/dashboard/appointments/${appointment.id}`} className="text-[11px] text-purple-600 font-semibold">
                  {t("viewDetails")}
                </a>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

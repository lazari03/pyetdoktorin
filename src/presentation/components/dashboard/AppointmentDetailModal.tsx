"use client";

import { useTranslation } from "react-i18next";
import { XMarkIcon, CalendarIcon, ClockIcon, UserIcon, DocumentTextIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { Appointment } from "@/domain/entities/Appointment";
import { isCanceledStatus, isRejectedStatus, isCompletedStatus, normalizeAppointmentStatus } from "@/presentation/utils/appointmentStatus";

interface AppointmentDetailModalProps {
  appointment: Appointment;
  isPast: boolean;
  onClose: () => void;
  onJoinCall: (appointmentId: string) => void;
}

function statusBadge(status: string, t: (k: string) => string) {
  const s = status?.toLowerCase?.() ?? "";
  if (isCompletedStatus(s))
    return { label: t("completed") || "Completed", cls: "bg-gray-100 text-gray-600" };
  if (isCanceledStatus(s))
    return { label: t("canceled") || "Canceled", cls: "bg-red-50 text-red-600" };
  if (isRejectedStatus(s))
    return { label: t("rejected") || "Rejected", cls: "bg-red-50 text-red-600" };
  if (s === "pending")
    return { label: t("pending") || "Pending", cls: "bg-amber-50 text-amber-700" };
  if (s === "accepted")
    return { label: t("accepted") || "Accepted", cls: "bg-green-50 text-green-700" };
  return { label: status, cls: "bg-gray-100 text-gray-600" };
}

export default function AppointmentDetailModal({
  appointment,
  isPast,
  onClose,
  onJoinCall,
}: AppointmentDetailModalProps) {
  const { t } = useTranslation();
  const badge = statusBadge(appointment.status, t);
  const canJoin =
    !isPast &&
    appointment.isPaid &&
    normalizeAppointmentStatus(appointment.status) === "accepted" &&
    !isCanceledStatus(appointment.status) &&
    !isRejectedStatus(appointment.status);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 50 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-purple-100 overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-white" />
          </button>
          <p className="text-xs uppercase tracking-[0.2em] text-purple-200 font-semibold">
            {t("appointmentDetails") || "Appointment details"}
          </p>
          <h2 className="text-xl font-semibold text-white mt-1 pr-10">
            {appointment.appointmentType || t("consultation") || "Consultation"}
          </h2>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        </div>

        {/* Details */}
        <div className="px-6 py-5 space-y-4">
          {/* Patient */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
              <UserIcon className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{t("patient") || "Patient"}</p>
              <p className="text-sm font-medium text-gray-900">{appointment.patientName || "—"}</p>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
              <CalendarIcon className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{t("date") || "Date"}</p>
              <p className="text-sm font-medium text-gray-900">{appointment.preferredDate || "—"}</p>
            </div>
          </div>

          {/* Time */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
              <ClockIcon className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{t("time") || "Time"}</p>
              <p className="text-sm font-medium text-gray-900">{appointment.preferredTime || "—"}</p>
            </div>
          </div>

          {/* Notes */}
          {appointment.notes && (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 h-9 w-9 rounded-full bg-purple-50 flex items-center justify-center">
                <DocumentTextIcon className="h-4.5 w-4.5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">{t("notes") || "Notes"}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{appointment.notes}</p>
              </div>
            </div>
          )}

          {/* Payment status */}
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-3">
            <span className={`h-2 w-2 rounded-full ${appointment.isPaid ? "bg-green-400" : "bg-amber-400"}`} />
            <span className="text-xs font-medium text-gray-600">
              {appointment.isPaid ? (t("paid") || "Paid") : (t("unpaid") || "Awaiting payment")}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t("close") || "Close"}
          </button>
          {canJoin && (
            <button
              onClick={() => onJoinCall(appointment.id)}
              className="flex-1 h-11 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <VideoCameraIcon className="h-4 w-4" />
              {t("joinNow") || "Join now"}
            </button>
          )}
          {isPast && (
            <span className="flex-1 h-11 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium flex items-center justify-center">
              {t("sessionEnded") || "Session ended"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Appointment } from "@/domain/entities/Appointment";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";
import { UserRole } from "@/domain/entities/UserRole";

type Props = {
  open: boolean;
  appointment: Appointment | null;
  role: UserRole;
  onClose: () => void;
};

export function AppointmentDetailsModal({ open, appointment, role, onClose }: Props) {
  const { t } = useTranslation();

  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open || !appointment) return null;

  const status = getAppointmentStatusPresentation(appointment.status);
  const isDoctor = role === UserRole.Doctor;
  const title = isDoctor ? (appointment.patientName || t("patient")) : (appointment.doctorName || t("doctor"));

  return (
    <div className="fixed inset-0 z-[300]">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label={t("close")}
      />
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div
          className="w-full md:max-w-lg md:mx-6 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-100 p-5 md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={t("appointmentSummary")}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-purple-600 font-semibold">
                {t("appointmentSummary")}
              </p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              ref={closeRef}
              className="h-9 w-9 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label={t("close")}
            >
              ✕
            </button>
          </div>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{t(isDoctor ? "doctor" : "patient")}</span>
              <span className="font-medium text-gray-900">
                {isDoctor ? (appointment.doctorName || t("doctor")) : (appointment.patientName || t("patient"))}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{t("type")}</span>
              <span className="font-medium text-gray-900">{appointment.appointmentType}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{t("date")}</span>
              <span className="font-medium text-gray-900">{appointment.preferredDate}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{t("time")}</span>
              <span className="font-medium text-gray-900">{appointment.preferredTime}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">{t("status")}</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} bg-opacity-10`}>
                {t(status.label)}
              </span>
            </div>
            {appointment.notes && (
              <div className="rounded-2xl bg-purple-50/60 px-3 py-2 text-gray-700">
                <p className="text-xs text-gray-500 mb-1">{t("notes")}</p>
                <p className="text-sm">“{appointment.notes}”</p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              {t("close")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

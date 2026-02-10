"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import "@i18n";
import { useAuth } from "@/context/AuthContext";
import { useAppointmentStore } from "@/store/appointmentStore";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import {
  isCanceledStatus,
  isRejectedStatus,
  normalizeAppointmentStatus,
} from "@/presentation/utils/appointmentStatus";

const isAcceptedStatus = (status?: string) => {
  const normalized = normalizeAppointmentStatus(status);
  return normalized === "accepted" || normalized === "completed";
};

export default function AdminReportDetailPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  const params = useParams<{ appointmentId?: string | string[] }>();
  const rawId = params?.appointmentId;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  useEffect(() => {
    if (role) {
      fetchAppointments(role);
    }
  }, [role, fetchAppointments]);

  const appointment = useMemo(
    () => appointments.find((item) => item.id === appointmentId),
    [appointments, appointmentId]
  );

  const statusPresentation = appointment
    ? getAppointmentStatusPresentation(appointment.status)
    : { label: "pending", color: "text-gray-500" };

  const cancelled = isCanceledStatus(appointment?.status);
  const rejected = isRejectedStatus(appointment?.status);
  const accepted = isAcceptedStatus(appointment?.status);
  const pending = !cancelled && !rejected && !accepted;

  const actorLabel = cancelled
    ? t("reportCancelledBy")
    : rejected
    ? t("reportRejectedBy")
    : accepted
    ? t("reportAcceptedBy")
    : t("reportPendingBy");
  const actorValue = cancelled
    ? (appointment?.patientName || t("reportUnknownActor"))
    : (appointment?.doctorName || t("reportUnknownActor"));

  const resolutionText = cancelled
    ? t("reportResolutionCancelled")
    : rejected
    ? t("reportResolutionRejected")
    : accepted
    ? t("reportResolutionAccepted")
    : t("reportResolutionPending");

  const createdAt = useMemo(() => {
    if (!appointment?.createdAt) return t("notProvided");
    const date = new Date(appointment.createdAt);
    if (Number.isNaN(date.getTime())) return t("notProvided");
    return date.toLocaleString();
  }, [appointment?.createdAt, t]);

  if (!appointmentId) {
    return (
      <div className="rounded-3xl bg-white border border-purple-50 shadow p-6 text-center">
        <p className="text-sm text-gray-600">{t("reportsEmpty")}</p>
        <Link href="/admin/reports" className="mt-3 inline-flex text-sm font-semibold text-purple-600">
          {t("reportBack")}
        </Link>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-4">
        <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
          <Link href="/admin/reports" className="text-xs font-semibold uppercase tracking-wide text-purple-600">
            {t("reportBack")}
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">{t("reportDetailTitle")}</h1>
          <p className="text-sm text-gray-600 mt-1">{t("reportDetailSubtitle")}</p>
        </section>
        <div className="rounded-3xl bg-white border border-purple-50 shadow p-6 text-center">
          <p className="text-sm text-gray-600">
            {loading ? t("loading") : t("reportsEmpty")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
        <Link href="/admin/reports" className="text-xs font-semibold uppercase tracking-wide text-purple-600">
          {t("reportBack")}
        </Link>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
          {t("reportDetailTitle")}
        </h1>
        <p className="text-sm text-gray-600 mt-2">{t("reportDetailSubtitle")}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">{t("reportSectionSummary")}</h2>
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusPresentation.color} bg-opacity-10`}
              >
                {t(statusPresentation.label)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <DetailItem label={t("reportFieldPatient")} value={appointment.patientName || t("reportUnknownActor")} />
              <DetailItem label={t("reportFieldDoctor")} value={appointment.doctorName || t("reportUnknownActor")} />
              <DetailItem label={t("reportFieldDate")} value={appointment.preferredDate || t("notProvided")} />
              <DetailItem label={t("reportFieldTime")} value={appointment.preferredTime || t("notProvided")} />
              <DetailItem label={t("reportFieldType")} value={appointment.appointmentType || t("notProvided")} />
              <DetailItem
                label={t("reportFieldPaid")}
                value={appointment.isPaid ? t("reportPaid") : t("reportUnpaid")}
              />
              <DetailItem label={t("reportFieldCreatedAt")} value={createdAt} />
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
            <h2 className="text-lg font-semibold text-gray-900">{t("reportSectionNotes")}</h2>
            <p className="text-sm text-gray-600 mt-2">
              {appointment.notes ? appointment.notes : t("reportNoNotes")}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">{t("reportSectionDecision")}</h2>
          <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-sm text-purple-800">
            {resolutionText}
          </div>
          <div className="text-sm text-gray-700">
            <p className="text-xs uppercase tracking-wide text-gray-500">{actorLabel}</p>
            <p className="mt-1 font-semibold">{actorValue}</p>
          </div>
          {pending && (
            <p className="text-xs text-gray-500">
              {t("appointmentNotificationInfo")}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

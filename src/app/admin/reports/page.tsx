"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@i18n";
import { useAdminDashboardStats } from "@/presentation/hooks/useAdminDashboardStats";
import { useAppointmentStore } from "@/store/appointmentStore";
import { AppointmentFilters, AppointmentFilter } from "@/presentation/components/appointments/AppointmentFilters";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { useAuth } from "@/context/AuthContext";
import { adminReportDetailPath } from "@/navigation/paths";
import {
  isCanceledStatus,
  isRejectedStatus,
  normalizeAppointmentStatus,
} from "@/presentation/utils/appointmentStatus";

const isCanceledOrRejectedStatus = (status?: string) =>
  isCanceledStatus(status) || isRejectedStatus(status);

const isAcceptedStatus = (status?: string) => {
  const normalized = normalizeAppointmentStatus(status);
  return normalized === "accepted" || normalized === "completed";
};

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { stats, loading: statsLoading } = useAdminDashboardStats();
  const {
    appointments,
    fetchAppointments,
    isAppointmentPast,
  } = useAppointmentStore();
  const [filter, setFilter] = useState<AppointmentFilter>("all");

  useEffect(() => {
    if (role) {
      fetchAppointments(role);
    }
  }, [role, fetchAppointments]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "past":
        return appointments.filter((a) => isAppointmentPast(a));
      case "canceled":
        return appointments.filter((a) => isCanceledOrRejectedStatus(a.status));
      case "upcoming":
        return appointments.filter((a) => !isAppointmentPast(a) && !isCanceledOrRejectedStatus(a.status));
      case "all":
      default:
        return appointments;
    }
  }, [appointments, filter, isAppointmentPast]);

  const cards = [
    {
      label: t("totalAppointments"),
      value: stats?.totalAppointments ?? "—",
      helper: t("allTime"),
    },
    {
      label: t("totalPrescriptions"),
      value: stats?.totalRecipes ?? "—",
      helper: t("generatedAcrossDoctors"),
    },
    {
      label: t("clinicBookings"),
      value: stats?.totalClinicBookings ?? "—",
      helper: t("privateClinics"),
    },
    {
      label: t("totalUsers"),
      value: stats?.totalUsers ?? "—",
      helper: t("registeredAccounts"),
    },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t("reportsEyebrow")}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
            {t("reportsTitle")}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {t("reportsSubtitle")}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl shadow-md border border-purple-50 p-5">
            <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {statsLoading && !stats ? <span className="text-gray-400">…</span> : card.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t("reportsListTitle")}</h2>
            <p className="text-sm text-gray-600">{t("reportsListSubtitle")}</p>
          </div>
          <AppointmentFilters active={filter} onChange={setFilter} />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
              {t("reportsEmpty")}
            </div>
          ) : (
            filtered.map((appointment) => {
              const statusPresentation = getAppointmentStatusPresentation(appointment.status);
              const statusLabel = t(statusPresentation.label);
              const cancelled = isCanceledStatus(appointment.status);
              const rejected = isRejectedStatus(appointment.status);
              const accepted = isAcceptedStatus(appointment.status);
              const actorLabel = cancelled
                ? t("reportCancelledBy")
                : rejected
                ? t("reportRejectedBy")
                : accepted
                ? t("reportAcceptedBy")
                : t("reportPendingBy");
              const actorValue = cancelled
                ? (appointment.patientName || t("reportUnknownActor"))
                : rejected
                ? (appointment.doctorName || t("reportUnknownActor"))
                : (appointment.doctorName || t("reportUnknownActor"));

	              return (
	                <Link
	                  key={appointment.id}
	                  href={adminReportDetailPath(appointment.id)}
	                  className="group block rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition hover:border-purple-300 hover:shadow-md"
	                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {appointment.patientName || t("patient")} • {appointment.doctorName || t("doctor")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {appointment.preferredDate} • {appointment.preferredTime} • {appointment.appointmentType}
                      </p>
                    </div>
                    <span className={`text-[11px] font-semibold px-3 py-1 rounded-full ${statusPresentation.color} bg-opacity-10`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-gray-600">
                      <span className="font-semibold text-gray-700">{actorLabel}: </span>
                      {actorValue}
                    </div>
                    <span className="text-purple-600 font-semibold group-hover:underline">
                      {t("viewReport")}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

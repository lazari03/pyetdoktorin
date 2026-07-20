"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "@i18n";
import { useAdminDashboardStats } from "@/presentation/hooks/useAdminDashboardStats";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useAdminStore } from "@/store/adminStore";
import { AppointmentFilters, AppointmentFilter } from "@/presentation/components/appointments/AppointmentFilters";
import { getAppointmentStatusPresentation } from "@/presentation/utils/getAppointmentStatusPresentation";
import { useAuth } from "@/context/AuthContext";
import { adminReportDetailPath } from "@/navigation/paths";
import {
  isCanceledStatus,
  isRejectedStatus,
  normalizeAppointmentStatus,
} from "@/presentation/utils/appointmentStatus";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';import { ADMIN_PATHS } from "@/navigation/paths";
import { UserRole } from "@/domain/entities/UserRole";
import { APPOINTMENT_PRICE_EUR, DOCTOR_PAYOUT_RATE } from "@/config/paywallConfig";

const isCanceledOrRejectedStatus = (status?: string) =>
  isCanceledStatus(status) || isRejectedStatus(status);

const isAcceptedStatus = (status?: string) => {
  const normalized = normalizeAppointmentStatus(status);
  return normalized === "accepted" || normalized === "completed";
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminReportsPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useAdminDashboardStats();
  const {
    appointments,
    fetchAppointments,
    isAppointmentPast,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointmentStore();
  const { users, loadUsers } = useAdminStore();
  const [filter, setFilter] = useState<AppointmentFilter>("all");

  useEffect(() => { loadUsers(); }, [loadUsers]);

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

  const topDoctors = useMemo(() => {
    const map = new Map<string, { doctorId: string; doctorName: string; count: number; completed: number }>();
    for (const a of appointments) {
      if (!a.doctorId || !a.doctorName) continue;
      const entry = map.get(a.doctorId) ?? { doctorId: a.doctorId, doctorName: a.doctorName, count: 0, completed: 0 };
      entry.count += 1;
      if (isAcceptedStatus(a.status)) entry.completed += 1;
      map.set(a.doctorId, entry);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [appointments]);

  // Bar chart: last 6 months appointments + revenue
  const chartData = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthAppts = appointments.filter((a) => {
        const ad = new Date(a.preferredDate);
        return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
      });
      // Platform commission actually held per paid appointment: total fee minus
      // the doctor's payout share. Uses each appointment's own snapshotted fee
      // (set by the doctor), falling back to the global default for older
      // appointments that predate per-doctor pricing.
      const platformCommission = monthAppts
        .filter((a) => a.isPaid)
        .reduce((sum, a) => sum + (a.feeAmount ?? APPOINTMENT_PRICE_EUR) * (1 - DOCTOR_PAYOUT_RATE), 0);
      return {
        label: MONTH_LABELS[d.getMonth()],
        count: monthAppts.length,
        revenue: platformCommission,
      };
    });
  }, [appointments]);

  const chartMaxCount = Math.max(...chartData.map((c) => c.count), 1);
  const chartMaxRev = Math.max(...chartData.map((c) => c.revenue), 1);

  // Users by role
  const roleSplit = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const u of users) {
      counts[u.role] = (counts[u.role] ?? 0) + 1;
    }
    const total = users.length || 1;
    const roleConfig: { role: UserRole; label: string; color: string }[] = [
      { role: UserRole.Patient, label: "Patients", color: "#7c3aed" },
      { role: UserRole.Doctor, label: "Doctors", color: "#0d9488" },
      { role: UserRole.Clinic, label: "Clinics", color: "#2563eb" },
      { role: UserRole.Pharmacy, label: "Pharmacies", color: "#d97706" },
    ];
    return roleConfig.map((rc) => ({
      label: rc.label,
      value: counts[rc.role] ?? 0,
      pct: `${Math.round(((counts[rc.role] ?? 0) / total) * 100)}%`,
      color: rc.color,
    }));
  }, [users]);

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
    <RequestStateGate
      loading={(statsLoading && !stats) || (appointmentsLoading && appointments.length === 0)}
      error={appointmentsError || statsError}
      onRetry={() => {
        refreshStats();
        if (role) fetchAppointments(role);
      }}
      homeHref={ADMIN_PATHS.root}
      loadingLabel={t("loading")}
      skeleton={<StatsPageSkeleton />}
      analyticsPrefix="admin.reports"
    >
      <div className="space-y-3">
        {/* KPI cards — 4 across */}
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold leading-none text-gray-900">
                {statsLoading && !stats ? <span className="text-gray-300">—</span> : card.value}
              </p>
              <p className="text-[11px] text-gray-400 leading-none">{card.helper}</p>
            </div>
          ))}
        </section>

        {/* Bar chart + side panels */}
        <div className="grid gap-3 xl:grid-cols-[1.55fr_1fr]">
          {/* Bar chart */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[13.5px] font-bold text-gray-900">Appointments &amp; commission held</p>
                <p className="text-[11.5px] text-gray-500">Last 6 months · your platform commission, not the doctor&apos;s share</p>
              </div>
              <div className="flex gap-4">
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-600 inline-block" />Appointments
                </span>
                <span className="text-[11px] text-gray-500 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-purple-200 inline-block" />Revenue
                </span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-4 h-48">
              {chartData.map((c) => (
                <div key={c.label} className="flex-1 flex flex-col items-center gap-2 h-full">
                  <div className="flex-1 w-full flex items-end justify-center gap-1.5">
                    <div
                      className="w-3.5 rounded-t-[5px] bg-purple-600"
                      style={{ height: `${Math.round((c.count / chartMaxCount) * 100)}%`, minHeight: c.count > 0 ? 4 : 0 }}
                    />
                    <div
                      className="w-3.5 rounded-t-[5px] bg-purple-200"
                      style={{ height: `${Math.round((c.revenue / chartMaxRev) * 100)}%`, minHeight: c.revenue > 0 ? 4 : 0 }}
                    />
                  </div>
                  <span className="text-[10.5px] text-gray-400 font-semibold">{c.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side: users by role + top doctors */}
          <div className="flex flex-col gap-3">
            {/* Users by role */}
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <p className="text-[13.5px] font-bold text-gray-900 mb-3">{t('usersByRole') || 'Users by role'}</p>
              <div className="flex flex-col gap-2.5">
                {roleSplit.map((r) => (
                  <div key={r.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11.5px] text-gray-500">{r.label}</span>
                      <span className="text-[11.5px] font-bold text-gray-900">{r.value}</span>
                    </div>
                    <div className="h-[7px] rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: r.pct, background: r.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top doctors */}
            {topDoctors.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                <p className="text-[13.5px] font-bold text-gray-900 mb-2">{t('topDoctors') || 'Top doctors'}</p>
                <div className="flex flex-col gap-0.5">
                  {topDoctors.slice(0, 5).map((doc, i) => (
                    <div key={doc.doctorId} className="flex items-center gap-2.5 py-1.5">
                      <span className="text-[11px] font-bold text-gray-400 w-3.5">{i + 1}</span>
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center font-bold text-[10.5px] shrink-0">
                        {doc.doctorName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold text-gray-900 truncate">{doc.doctorName}</p>
                      </div>
                      <span className="text-[12px] font-bold text-gray-900">{doc.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reports list */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 border-b border-gray-100">
            <div>
              <p className="text-[13.5px] font-bold text-gray-900">{t("reportsListTitle") || "Appointment reports"}</p>
              <p className="text-[11.5px] text-gray-500">{t("reportsListSubtitle") || "Review, audit, and export consultation activity"}</p>
            </div>
            <AppointmentFilters active={filter} onChange={setFilter} />
          </div>

          {filtered.length === 0 ? (
            <div className="px-4 py-4 text-center text-sm text-gray-500">{t("reportsEmpty")}</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  {["Patient / Doctor","Schedule","Type","Handled by","Status",""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-4 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((appointment) => {
                  const statusPresentation = getAppointmentStatusPresentation(appointment.status);
                  const statusLabel = t(statusPresentation.label);
                  const cancelled = isCanceledStatus(appointment.status);
                  const rejected = isRejectedStatus(appointment.status);
                  const accepted = isAcceptedStatus(appointment.status);
                  const actorValue = cancelled
                    ? (appointment.patientName || t("reportUnknownActor"))
                    : (appointment.doctorName || t("reportUnknownActor"));
                  const badgeTone = accepted
                    ? "bg-green-50 text-green-700"
                    : cancelled || rejected
                    ? "bg-red-50 text-red-700"
                    : "bg-amber-50 text-amber-700";
                  return (
                    <tr key={appointment.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors cursor-pointer">
                      <td className="px-4 py-3">
                        <p className="text-[12.5px] font-semibold text-gray-900">{appointment.patientName || t("patient")}</p>
                        <p className="text-[10.5px] text-gray-400">with {appointment.doctorName || t("doctor")}</p>
                      </td>
                      <td className="px-3 py-3">
                        <p className="text-[12px] text-gray-700">{appointment.preferredDate}</p>
                        <p className="text-[10.5px] text-gray-400">{appointment.preferredTime}</p>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-gray-500">{appointment.appointmentType}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-500">{actorValue}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold ${badgeTone}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={adminReportDetailPath(appointment.id)}
                          className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
                          data-analytics={`admin.reports.open.${appointment.id}`}
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </RequestStateGate>
  );
}

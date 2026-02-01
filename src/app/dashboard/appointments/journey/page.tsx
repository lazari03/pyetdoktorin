"use client";

import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import RoleGuard from "@/presentation/components/RoleGuard/RoleGuard";
import { useAppointmentsViewModel } from "@/presentation/view-models/useAppointmentsViewModel";
import { AppointmentSummaryCard } from "@/presentation/components/appointments/AppointmentSummaryCard";
import { AppointmentFilters, AppointmentFilter } from "@/presentation/components/appointments/AppointmentFilters";
import { AppointmentTimeline } from "@/presentation/components/appointments/AppointmentTimeline";
import { sortAppointments } from "@/presentation/utils/sortAppointments";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

function JourneyPage() {
  const vm = useAppointmentsViewModel();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<AppointmentFilter>("upcoming");

  const sorted = useMemo(
    () => (vm.appointments?.length ? sortAppointments(vm.appointments, 300) : []),
    [vm.appointments]
  );

  const isCanceled = (apptStatus: string) => apptStatus?.toLowerCase?.() === "cancelled";

  const heroAppointment = useMemo(() => {
    const upcoming = sorted.find((a) => !isCanceled(a.status) && !vm.isAppointmentPast(a));
    return upcoming ?? sorted[0];
  }, [sorted, vm]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "past":
        return sorted.filter((a) => vm.isAppointmentPast(a));
      case "canceled":
        return sorted.filter((a) => isCanceled(a.status));
      case "upcoming":
        return sorted.filter((a) => !vm.isAppointmentPast(a) && !isCanceled(a.status));
      default:
        return sorted;
    }
  }, [filter, sorted, vm]);

  const visitsThisMonth = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return sorted.filter((a) => {
      const d = new Date(a.preferredDate);
      return d.getMonth() === m && d.getFullYear() === y;
    }).length;
  }, [sorted]);

  const completedCount = sorted.filter((a) => a.status?.toLowerCase?.() === "accepted").length;
  const pendingCount = sorted.filter((a) => a.status?.toLowerCase?.() === "pending").length;

  return (
    <div className="min-h-screen bg-gradient-to-b">
      <RedirectingModal show={vm.showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t("appointmentJourneyTitle")}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">
              {t("yourAppointments")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/new-appointment"
              className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-purple-700"
            >
              {t("bookNewAppointment")}
            </Link>
          </div>
        </header>

        {heroAppointment ? (
          <AppointmentSummaryCard
            appointment={heroAppointment}
            role={vm.userRole}
            isAppointmentPast={vm.isAppointmentPast}
            onJoinCall={vm.handleJoinCall}
            onPayNow={vm.handlePayNow}
          />
        ) : (
          <div className="rounded-3xl bg-white border border-purple-50 shadow p-6 text-center">
            <p className="text-lg font-semibold text-gray-900">{t("noUpcoming")}</p>
            <p className="text-sm text-gray-600 mt-1">{t("emptyJourneyCopy")}</p>
            <Link
              href="/dashboard/new-appointment"
              className="mt-3 inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
            >
              {t("bookNewAppointment")}
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricTile label={t("visitsThisMonth")} value={visitsThisMonth.toString()} />
          <MetricTile label={t("completedVisits")} value={completedCount.toString()} />
          <MetricTile label={t("pendingActions")} value={pendingCount.toString()} tone="amber" />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <AppointmentFilters active={filter} onChange={setFilter} />
          <span className="text-xs text-gray-500">
            {filtered.length} {t("appointments") ?? "appointments"}
          </span>
        </div>

        <section className="rounded-3xl bg-white border border-purple-50 shadow-lg p-4">
          {filtered.length > 0 ? (
            <AppointmentTimeline
              items={filtered}
              role={vm.userRole}
              isAppointmentPast={vm.isAppointmentPast}
              onJoinCall={vm.handleJoinCall}
              onPayNow={vm.handlePayNow}
            />
          ) : (
            <div className="py-10 text-center text-sm text-gray-600">
              {t("emptyJourneyCopy")}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone = "purple",
}: {
  label: string;
  value: string;
  tone?: "purple" | "amber";
}) {
  const toneClasses =
    tone === "amber"
      ? "bg-amber-50 border-amber-100 text-amber-700"
      : "bg-purple-50 border-purple-100 text-purple-700";
  return (
    <div className={`rounded-2xl border ${toneClasses} p-4 shadow-sm`}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

function JourneyPageWrapper() {
  return (
    <RoleGuard allowedRoles={['doctor', 'patient']}>
      <JourneyPage />
    </RoleGuard>
  );
}

export default JourneyPageWrapper;

"use client";
export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import {
  useDashboardStore,
  AppointmentFilter,
} from "@/store/dashboardStore";
import { useAppointmentStore } from "@/store/appointmentStore";
import { isProfileIncomplete } from "@/store/generalStore";
import { CheckProfileCompleteUseCase } from "@/application/checkProfileCompleteUseCase";
import { FetchAppointmentsUseCase } from "@/application/fetchAppointmentsUseCase";
import { userRepository } from "@/infrastructure/userRepository";
import { appointmentRepository } from "@/infrastructure/appointmentRepository";
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { UserRole } from "@/domain/entities/UserRole";
import Link from "next/link";
import Loader from "@/app/components/Loader";
import RedirectingModal from "@/app/components/RedirectingModal";
import ProfileWarning from "@/app/components/ProfileWarning";
import DashboardNotificationsBell from "@/app/components/DashboardNotificationsBell";
import UpcomingAppointment from "@/app/components/appointment/UpcomingAppointment";
import AppointmentsTable from "@/app/components/appointment/AppointmentsTable";
import DashboardBanner from "@/app/components/DashboardBanner";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const {
    totalAppointments,
    fetchAppointments,
    activeFilter,
    setActiveFilter,
    showRedirecting,
    setShowRedirecting,
  } = useDashboardStore();
  const {
    appointments,
    isAppointmentPast,
    fetchAppointments: fetchAllAppointments,
  } = useAppointmentStore();
  const { handleJoinCall: baseHandleJoinCall, handlePayNow } =
    useDashboardActions();
  const [profileIncomplete, setProfileIncomplete] = useState(true);
  const [loading, setLoading] = useState(true);

  // Show modal and join call
  const handleJoinCall = async (appointmentId: string) => {
    setShowRedirecting(true);
    try {
      await baseHandleJoinCall(appointmentId);
    } finally {
      setShowRedirecting(false);
    }
  };

  const checkProfileUseCase = useMemo(
    () => new CheckProfileCompleteUseCase(userRepository),
    []
  );
  const fetchAppointmentsUseCase = useMemo(
    () => new FetchAppointmentsUseCase(appointmentRepository),
    []
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchAll = async () => {
      try {
        if (user && role) {
          setProfileIncomplete(
            await isProfileIncomplete(
              role,
              user.uid,
              checkProfileUseCase
            )
          );
          await Promise.all([
            fetchAppointments(
              user.uid,
              role,
              fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)
            ),
            fetchAllAppointments(
              user.uid,
              role === UserRole.Doctor,
              fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)
            ),
          ]);
        }
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading) {
      fetchAll();
      timeout = setTimeout(() => setLoading(false), 5000);
    }
    return () => timeout && clearTimeout(timeout);
  }, [
    user,
    role,
    fetchAppointments,
    fetchAllAppointments,
    authLoading,
    checkProfileUseCase,
    fetchAppointmentsUseCase,
  ]);

  const filteredAppointments = useMemo(() => {
    if (!appointments) return [];

    switch (activeFilter) {
      case AppointmentFilter.Unpaid:
        return appointments.filter(
          (a) => a.isPaid === false || a.status === "pending"
        );
      case AppointmentFilter.Past:
        return appointments.filter((a) => isAppointmentPast(a));
      case AppointmentFilter.All:
      default:
        return appointments;
    }
  }, [appointments, activeFilter, isAppointmentPast]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <RedirectingModal show={showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT: main content without white outer card */}
        <main className="flex-1 flex flex-col">
          <div className="dashboard-main-inner flex flex-col flex-1">
            {role === UserRole.Doctor && user?.uid && (
              <div className="flex items-center justify-between mb-4">
                {/* keep bell aligned with nav, but inline above banner */}
                <DashboardNotificationsBell doctorId={user.uid} />
              </div>
            )}

            <ProfileWarning show={profileIncomplete} />
            <div className="flex-1 flex flex-col mt-2">
              <DashboardBanner />
              <section className="dashboard-table-card mt-4">
                {/* Top bar: Last activity + count + view all */}
                <div className="flex items-center justify-between px-4 sm:px-6 pt-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                      {t("lastActivity") ?? t("yourAppointments")}
                    </h2>
                    <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-lime-300 text-xs font-semibold text-gray-900 px-2">
                      {totalAppointments}
                    </span>
                  </div>
                  <Link
                    href="/dashboard/appointments"
                    className="text-xs sm:text-sm font-medium text-indigo-500 hover:text-indigo-600"
                  >
                    {t("viewAll")}
                  </Link>
                </div>

                {/* Tabs row: All / Unpaid / Past as filters */}
                <div className="mt-4 px-4 sm:px-6 border-b border-gray-200">
                  <div className="flex gap-6 text-xs sm:text-sm font-medium text-gray-500">
                    <button
                      className={
                        "pb-3 border-b-2 transition-colors " +
                        (activeFilter === AppointmentFilter.All
                          ? "border-primary text-primary"
                          : "border-transparent hover:text-primary")
                      }
                      onClick={() => setActiveFilter(AppointmentFilter.All)}
                    >
                      All
                    </button>
                    <button
                      className={
                        "pb-3 border-b-2 transition-colors " +
                        (activeFilter === AppointmentFilter.Unpaid
                          ? "border-primary text-primary"
                          : "border-transparent hover:text-primary")
                      }
                      onClick={() => setActiveFilter(AppointmentFilter.Unpaid)}
                    >
                      Unpaid
                    </button>
                    <button
                      className={
                        "pb-3 border-b-2 transition-colors " +
                        (activeFilter === AppointmentFilter.Past
                          ? "border-primary text-primary"
                          : "border-transparent hover:text-primary")
                      }
                      onClick={() => setActiveFilter(AppointmentFilter.Past)}
                    >
                      Past
                    </button>
                  </div>
                </div>

                <div className="px-4 sm:px-6 pb-4">
                  <AppointmentsTable
                    appointments={filteredAppointments}
                    role={role || ""}
                    isAppointmentPast={isAppointmentPast}
                    handleJoinCall={handleJoinCall}
                    handlePayNow={handlePayNow}
                  />
                </div>
              </section>
            </div>
          </div>
        </main>

        {/* RIGHT: side widgets */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          <div className="dashboard-widget dashboard-widget-black flex flex-col justify-between">
            <div className="mb-3">
              <p className="text-xs text-gray-300 mb-1">{t("nextVisit")}</p>
              <div className="bg-gray-900/60 rounded-xl p-3 mt-1">
                <UpcomingAppointment />
              </div>
            </div>
            <button className="mt-2 text-xs font-medium text-lime-300">
              {t("moreDetails") ?? "More details"}
            </button>
          </div>

          <div className="dashboard-widget dashboard-widget-lime flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold tracking-wide text-gray-900">
                {t("totalAppointments")}
              </p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {totalAppointments}
              </p>
            </div>
            <p className="text-xs text-gray-800/80">
              {t("appointmentsSummaryText") ??
                "Overview of your recent activity and scheduled visits."}
            </p>
          </div>

          <div className="dashboard-widget dashboard-widget-promo">
            <p className="text-3xl font-bold mb-1">40% off</p>
            <p className="text-lg font-semibold mb-2">
              {t("premiumPlan") ?? "premium"}
            </p>
            <p className="text-xs text-indigo-50 mb-4 max-w-xs">
              {t("premiumCopy") ??
                "It is a long established fact that a reader will be distracted by the content of a page when."}
            </p>
            <button className="inline-flex items-center justify-center rounded-2xl bg-black/80 px-4 py-2 text-sm font-semibold text-white hover:bg-black">
              {t("upgrade") ?? "UPGRADE"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
"use client";
export const dynamic = "force-dynamic";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardStore } from "@/store/dashboardStore";
import { useAppointmentStore } from "@/store/appointmentStore";
import { isProfileIncomplete } from "@/store/generalStore";
import { CheckProfileCompleteUseCase } from '@/application/checkProfileCompleteUseCase';
import { FetchAppointmentsUseCase } from '@/application/fetchAppointmentsUseCase';
import { userRepository } from '@/infrastructure/userRepository';
import { appointmentRepository } from '@/infrastructure/appointmentRepository';
import { useDashboardActions } from "@/hooks/useDashboardActions";
import { UserRole } from "@/domain/entities/UserRole";
import Link from "next/link";
import Loader from "@/app/components/Loader";
import RedirectingModal from "@/app/components/RedirectingModal";
import ProfileWarning from "@/app/components/ProfileWarning";
// Search bar intentionally removed from UI per request
// import DashboardDoctorSearchBar from "@/app/components/DashboardDoctorSearchBar";
import DashboardNotificationsBell from "@/app/components/DashboardNotificationsBell";
import UpcomingAppointment from "@/app/components/appointment/UpcomingAppointment";
import AppointmentsTable from "@/app/components/appointment/AppointmentsTable";


export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const { totalAppointments, fetchAppointments } = useDashboardStore();
  const { appointments, isAppointmentPast, fetchAppointments: fetchAllAppointments } = useAppointmentStore();
  const { handleJoinCall: baseHandleJoinCall, handlePayNow } = useDashboardActions();
  const [showRedirecting, setShowRedirecting] = useState(false);
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

  // Memoize use cases to avoid recreating on every render
  const checkProfileUseCase = useMemo(() => new CheckProfileCompleteUseCase(userRepository), []);
  const fetchAppointmentsUseCase = useMemo(() => new FetchAppointmentsUseCase(appointmentRepository), []);

  // Fetch profile status and appointments
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const fetchAll = async () => {
      try {
        if (user && role) {
          setProfileIncomplete(await isProfileIncomplete(role, user.uid, checkProfileUseCase));
          await Promise.all([
            fetchAppointments(user.uid, role, fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase)),
            fetchAllAppointments(user.uid, role === UserRole.Doctor, fetchAppointmentsUseCase.execute.bind(fetchAppointmentsUseCase))
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
  }, [user, role, fetchAppointments, fetchAllAppointments, authLoading, checkProfileUseCase, fetchAppointmentsUseCase]);

  if (authLoading || loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-purple-100">
      <RedirectingModal show={showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 flex flex-col lg:flex-row gap-6">
        {/* LEFT: main content without white outer card */}
        <main className="flex-1">
          <div className="dashboard-main-inner">
            <header className="flex items-center justify-between mb-6">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {t("welcomeToDashboard", { role: role || t("user") })}
              </h1>
              {role === UserRole.Doctor && user?.uid && (
                <DashboardNotificationsBell doctorId={user.uid} />
              )}
            </header>

            {/* Search removed as requested */}
            {/* {role === UserRole.Patient && <DashboardDoctorSearchBar />} */}
            <ProfileWarning show={profileIncomplete} />

            {/* Appointments table */}
            <section className="dashboard-table-card mt-4">
              <div className="dashboard-table-header">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  {t("yourAppointments")}
                </h2>
                <Link href="/dashboard/appointments" className="dashboard-link-muted">
                  {t("viewAll")}
                </Link>
              </div>
              <div className="px-4 sm:px-6 pb-4">
                <AppointmentsTable
                  appointments={appointments}
                  role={role || ""}
                  isAppointmentPast={isAppointmentPast}
                  handleJoinCall={handleJoinCall}
                  handlePayNow={handlePayNow}
                />
              </div>
            </section>
          </div>
        </main>

        {/* RIGHT: side widgets; top one is upcoming appointments (black card) */}
        <aside className="w-full lg:w-80 flex flex-col gap-4">
          {/* Upcoming appointment summary as black card */}
          <div className="dashboard-widget dashboard-widget-black flex flex-col justify-between">
            <div className="mb-3">
              <p className="text-xs text-gray-300 mb-1">{t("nextVisit")}</p>
              {/* Reuse existing UpcomingAppointment component inside */}
              <div className="bg-gray-900/60 rounded-xl p-3 mt-1">
                <UpcomingAppointment />
              </div>
            </div>
            <button className="mt-2 text-xs font-medium text-lime-300">
              {t("moreDetails") ?? "More details"}
            </button>
          </div>

          {/* Total appointments card (lime) */}
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
              {t("appointmentsSummaryText") ?? "Overview of your recent activity and scheduled visits."}
            </p>
          </div>

          {/* Promo widget (gradient) */}
          <div className="dashboard-widget dashboard-widget-promo">
            <p className="text-3xl font-bold mb-1">40% off</p>
            <p className="text-lg font-semibold mb-2">{t("premiumPlan") ?? "premium"}</p>
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
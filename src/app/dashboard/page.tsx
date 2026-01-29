
"use client";
import "./dashboard.css";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import Link from "next/link";
import { AppointmentFilter } from "@/store/dashboardStore";
import Loader from "@/presentation/components/Loader/Loader";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import ProfileWarning from "@/presentation/components/ProfileWarning/ProfileWarning";
import UpcomingAppointment from "@/presentation/components/appointment/UpcomingAppointment";
import AppointmentsTable from "@/presentation/components/AppointmentsTable/AppointmentsTable";
import DashboardBanner from "@/presentation/components/DashboardBanner/DashboardBanner";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const authContext: DashboardUserContext = {
  userId: user?.uid ?? null,
  role: role ?? null,
  authLoading,
};
  const vm = useDashboardViewModel(authContext);
  const displayName = user?.name || t("user");
  const completedCount = vm.appointments.filter((a) => vm.isAppointmentPast(a)).length;
  const pendingCount = vm.appointments.filter((a) => a.status === "pending").length;
  const upcomingCount = vm.appointments.filter((a) => !vm.isAppointmentPast(a) && a.status === "accepted").length;
  const progressScore =
    vm.totalAppointments > 0
      ? Math.min(100, Math.round((completedCount / vm.totalAppointments) * 100))
      : 0;

  // Show modal and join call
  const handleJoinCall = async (appointmentId: string) => {
    vm.setShowRedirecting(true);
    try {
      await vm.baseHandleJoinCall(appointmentId);
    } finally {
      vm.setShowRedirecting(false);
    }
  };

  if (vm.authLoading || vm.loading) return <Loader />;

  return (
    <div className="dashboard-page">
      <RedirectingModal show={vm.showRedirecting} />
      <div className="dashboard-shell">
        <main className="dashboard-main">
          <section className="dash-hero">
            <div>
              <p className="dash-hero-eyebrow">{t("dashboardWelcomeEyebrow")}</p>
              <h1 className="dash-hero-title">
                {t("dashboardWelcome", { name: displayName })}
              </h1>
              <p className="dash-hero-subtitle">{t("dashboardWelcomeSubtitle")}</p>
            </div>
            <div className="dash-kpi-row">
              <div className="dash-kpi">
                <div className="dash-kpi-label">{t("dashboardKpiUpcoming")}</div>
                <div className="dash-kpi-value">{upcomingCount}</div>
              </div>
              <div className="dash-kpi">
                <div className="dash-kpi-label">{t("dashboardKpiPending")}</div>
                <div className="dash-kpi-value">{pendingCount}</div>
              </div>
              <div className="dash-kpi">
                <div className="dash-kpi-label">{t("dashboardKpiCompleted")}</div>
                <div className="dash-kpi-value">{completedCount}</div>
              </div>
            </div>
          </section>

          <ProfileWarning show={vm.profileIncomplete} />
          <DashboardBanner />
          <section className="dashboard-card">
            <div className="dashboard-card-header">
              <div className="flex items-center gap-3">
                <h2 className="dashboard-title">{t("lastActivity") ?? t("yourAppointments")}</h2>
                <span className="dashboard-count">{vm.totalAppointments}</span>
              </div>
              <Link href="/dashboard/appointments" className="dashboard-link">
                {t("viewAll")}
              </Link>
            </div>
            <div className="dashboard-tabs">
              <button
                className={`dashboard-tab ${vm.activeFilter === AppointmentFilter.All ? "is-active" : ""}`}
                onClick={() => vm.setActiveFilter(AppointmentFilter.All)}
              >
                {t("dashboardFilterAll")}
              </button>
              <button
                className={`dashboard-tab ${vm.activeFilter === AppointmentFilter.Unpaid ? "is-active" : ""}`}
                onClick={() => vm.setActiveFilter(AppointmentFilter.Unpaid)}
              >
                {t("dashboardFilterUnpaid")}
              </button>
              <button
                className={`dashboard-tab ${vm.activeFilter === AppointmentFilter.Past ? "is-active" : ""}`}
                onClick={() => vm.setActiveFilter(AppointmentFilter.Past)}
              >
                {t("dashboardFilterPast")}
              </button>
            </div>
            <div className="dashboard-table-body">
              <AppointmentsTable
                appointments={vm.filteredAppointments}
                role={vm.role || ""}
                isAppointmentPast={vm.isAppointmentPast}
                handleJoinCall={handleJoinCall}
                handlePayNow={vm.handlePayNow}
              />
            </div>
          </section>

          <section className="dashboard-card dash-progress-card">
            <div className="dash-progress-header">
              <div>
                <p className="dash-progress-title">{t("dashboardProgressTitle")}</p>
                <p className="dash-progress-subtitle">{t("dashboardProgressSubtitle")}</p>
              </div>
              <span className="dash-progress-score">{progressScore}%</span>
            </div>
            <div className="dash-progress-bar">
              <div className="dash-progress-fill" style={{ width: `${progressScore}%` }} />
            </div>
            <div className="dash-progress-meta">
              <div>{t("dashboardProgressMetaLeft")}</div>
              <div>{t("dashboardProgressMetaRight")}</div>
            </div>
          </section>
        </main>

        <aside className="dashboard-aside">
          <div className="dashboard-widget dashboard-widget-dark">
            <div className="dashboard-widget-title">{t("nextVisit")}</div>
            <div className="dashboard-widget-box">
              <UpcomingAppointment />
            </div>
            <button className="dashboard-widget-action">
              {t("moreDetails") ?? "More details"}
            </button>
          </div>

          <div className="dashboard-widget dashboard-widget-accent">
            <div>
              <p className="dash-stat-title">{t("totalAppointments")}</p>
              <p className="dash-stat-value">{vm.totalAppointments}</p>
            </div>
            <p className="dash-stat-body">
              {t("appointmentsSummaryText") ??
                "Overview of your recent activity and scheduled visits."}
            </p>
          </div>

          <div className="dashboard-widget dashboard-widget-plan">
            <p className="dash-plan-title">{t("dashboardPlanTitle")}</p>
            <div className="dash-plan-row">
              <span className="dash-plan-value">06</span>
              <div>
                <p className="dash-plan-subtitle">{t("dashboardPlanSubtitle")}</p>
                <p className="dash-plan-caption">{t("dashboardPlanCaption")}</p>
              </div>
            </div>
            <div className="dash-plan-chart" aria-hidden="true">
              {Array.from({ length: 12 }).map((_, idx) => (
                <span key={idx} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}


"use client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import Loader from "@/presentation/components/Loader/Loader";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import ProfileWarning from "@/presentation/components/ProfileWarning/ProfileWarning";
import AppointmentsTable from "@/presentation/components/AppointmentsTable/AppointmentsTable";
import Link from "next/link";
import { HeroCard } from "@/presentation/components/dashboard/HeroCard";
import { RecentDoctorsList, RecentDoctor } from "@/presentation/components/dashboard/RecentDoctorsList";
import { CheckupReminderCard } from "@/presentation/components/dashboard/CheckupReminderCard";
import { NotificationCard } from "@/presentation/components/dashboard/NotificationCard";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const nav = useNavigationCoordinator();
  const authContext: DashboardUserContext = {
  userId: user?.uid ?? null,
  role: role ?? null,
  authLoading,
  };
  const vm = useDashboardViewModel(authContext);

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

  const upcoming = vm.filteredAppointments.filter((a) => !vm.isAppointmentPast(a)).slice(0, 3);
  const heroAppointment = upcoming[0];
  const recentDoctorsMap = vm.filteredAppointments
    .filter((a) => a.doctorId)
    .map(
      (a): RecentDoctor => ({
        id: a.doctorId,
        name: a.doctorName || "",
        specialty: a.appointmentType,
        lastVisit: a.preferredDate,
      })
    )
    .filter((d) => d.name) // ensure name exists
    .reduce<Record<string, RecentDoctor>>((acc, doc) => {
      if (!acc[doc.id] || (acc[doc.id].lastVisit ?? "") < (doc.lastVisit ?? "")) acc[doc.id] = doc;
      return acc;
    }, {});
  const recentDoctorList = Object.values(recentDoctorsMap).slice(0, 3);

  return (
    <div className="min-h-screen">
      <RedirectingModal show={vm.showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 space-y-6">
        <ProfileWarning show={vm.profileIncomplete} />
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {heroAppointment ? (
              <HeroCard
                title={heroAppointment.doctorName || t("yourNextConsultation") || "Your next consultation"}
                subtitle={heroAppointment.appointmentType || t("stayPrepared") || "Stay prepared for your upcoming session"}
                helper={`${t("consultation") || "Consultation"} • ${heroAppointment.preferredDate ?? (t("today") || "Today")}`}
                onJoin={() => heroAppointment && handleJoinCall(heroAppointment.id)}
                onPay={
                  heroAppointment && role === "patient" && !heroAppointment.isPaid
                    ? () => {
                        const amount = Number.parseFloat(process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD || "");
                        const safeAmount = Number.isFinite(amount) && amount > 0 ? amount : 13;
                        vm.handlePayNow(heroAppointment.id, safeAmount);
                      }
                    : undefined
                }
                isPaid={heroAppointment.isPaid}
                onViewProfile={
                  heroAppointment.doctorId
                    ? () => nav.pushPath(`/doctor/${heroAppointment.doctorId}`)
                    : undefined
                }
                ctaLabel={t("joinNow") || "Join now"}
                payLabel={t("payNow") || "Pay now"}
                profileLabel={t("viewDoctor") || "View doctor"}
              />
            ) : (
              <HeroCard
                title={t("noUpcomingTitle") || "When was your last visit?"}
                subtitle={t("noUpcomingSubtitle") || "Stay on top of your health—book a quick consultation now."}
                helper={t("noUpcomingHelper") || "Secure telemedicine on alodoktor.al"}
                onJoin={() => nav.pushPath("/dashboard/new-appointment")}
                ctaLabel={t("bookNow") || "Book now"}
              />
            )}
          </div>
          <div className="lg:col-span-1">
            <NotificationCard appointments={vm.filteredAppointments} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">{t("recentDoctors") ?? "Recent doctors"}</p>
            </div>
            <div className="flex-1">
              <RecentDoctorsList doctors={recentDoctorList} />
            </div>
          </section>

          <CheckupReminderCard />

          <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t("visits") ?? "Visits"}</p>
                <p className="text-4xl font-extrabold mt-1 text-purple-700">{vm.totalAppointments}</p>
                <p className="text-xs text-gray-600">{t("lastMonth") ?? "last month"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-purple-600 font-semibold">{t("pendingActions") ?? "Pending actions"}</p>
                <p className="text-lg font-semibold text-purple-800">
                  {vm.filteredAppointments.filter((a) => a.status?.toLowerCase?.() === "pending").length}
                </p>
                <p className="text-[11px] text-purple-700/80">{t("pendingActionsCopy") ?? "Awaiting confirmation or payment."}</p>
              </div>
              <div className="rounded-xl border border-gray-200 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wide text-gray-600 font-semibold">{t("upcoming") ?? "Upcoming"}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {vm.filteredAppointments.filter((a) => !vm.isAppointmentPast(a)).length}
                </p>
                <p className="text-[11px] text-gray-600">{t("upcomingCopy") ?? "Including today and future visits."}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
            </div>
          </section>
        </div>

        <section className="bg-white rounded-3xl shadow-lg p-4 border border-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              {t("yourAppointments")}
            </h2>
            <Link href="/dashboard/appointments" className="text-xs text-purple-600 hover:underline">
              {t("viewAll")}
            </Link>
          </div>
          <AppointmentsTable
            appointments={vm.filteredAppointments}
            role={vm.role || ""}
            isAppointmentPast={vm.isAppointmentPast}
            handleJoinCall={handleJoinCall}
            handlePayNow={vm.handlePayNow}
            maxRows={5}
          />
        </section>
      </div>
    </div>
  );
}

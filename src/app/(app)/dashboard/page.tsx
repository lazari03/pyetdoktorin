
"use client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import ProfileWarning from "@/presentation/components/ProfileWarning/ProfileWarning";
import AppointmentsTable from "@/presentation/components/AppointmentsTable/AppointmentsTable";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HeroCard } from "@/presentation/components/dashboard/HeroCard";
import { RecentDoctorsList, RecentDoctor } from "@/presentation/components/dashboard/RecentDoctorsList";
import { RecentPatientsList, RecentPatient } from "@/presentation/components/dashboard/RecentPatientsList";
import { CheckupReminderCard } from "@/presentation/components/dashboard/CheckupReminderCard";
import { DoctorEarningsCard, MonthlyEarning } from "@/presentation/components/dashboard/DoctorEarningsCard";
import { NotificationCard } from "@/presentation/components/dashboard/NotificationCard";
import { DoctorQuickActionsCard } from "@/presentation/components/dashboard/DoctorQuickActionsCard";
import { DashboardTutorialGate } from "@/presentation/components/dashboard/DashboardTutorialGate";
import { PatientKpiCards, PatientKpiData } from "@/presentation/components/dashboard/PatientKpiCards";
import { PatientQuickActions } from "@/presentation/components/dashboard/PatientQuickActions";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";
import { UserRole } from "@/domain/entities/UserRole";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import { isCompletedStatus, isCanceledStatus, isRejectedStatus } from "@/presentation/utils/appointmentStatus";

const isCanceledOrRejectedStatus = (status?: string) =>
  isCanceledStatus(status) || isRejectedStatus(status);
const DASHBOARD_APPOINTMENTS_PAGE_SIZE = 5;
import { sortAppointments } from "@/presentation/utils/sortAppointments";
import { getAppointmentAction } from "@/presentation/utils/getAppointmentAction";
import { getAppointmentActionPresentation } from "@/presentation/utils/getAppointmentActionPresentation";
import { APPOINTMENT_PRICE_EUR, DOCTOR_PAYOUT_RATE } from "@/config/paywallConfig";
import { syncPaddlePaymentWithRetry } from "@/network/payments";
import { listAppointments } from "@/network/appointments";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useEffect, useRef, useState } from "react";
import { useDI } from "@/context/DIContext";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";

// Helper function to calculate monthly earnings
function calculateMonthlyEarnings(appointments: Array<{ doctorId: string; patientId: string; patientName?: string; doctorName: string; status?: string; isPaid: boolean; preferredDate: string }>, userId: string, _role: UserRole) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const payoutPercentage = DOCTOR_PAYOUT_RATE;
  const appointmentAmount = APPOINTMENT_PRICE_EUR;
  
  // Filter completed/paid appointments for this doctor
  const doctorAppointments = appointments.filter(a =>
    a.doctorId === userId &&
    isCompletedStatus(a.status) &&
    a.isPaid
  );
  
  // Current month earnings
  const currentMonthAppointments = doctorAppointments.filter(a => {
    const appDate = new Date(a.preferredDate);
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  });
  
  const currentMonthEarnings = currentMonthAppointments.length * appointmentAmount * payoutPercentage;
  
  // Previous month earnings
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthAppointments = doctorAppointments.filter(a => {
    const appDate = new Date(a.preferredDate);
    return appDate.getMonth() === prevMonth && appDate.getFullYear() === prevYear;
  });
  
  const previousMonthEarnings = previousMonthAppointments.length * appointmentAmount * payoutPercentage;
  
  // Build monthly history (last 6 months)
  const monthlyHistory: MonthlyEarning[] = [];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  for (let i = 0; i < 6; i++) {
    const monthIndex = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    
    const monthApps = doctorAppointments.filter(a => {
      const appDate = new Date(a.preferredDate);
      return appDate.getMonth() === monthIndex && appDate.getFullYear() === year;
    });
    
    monthlyHistory.push({
      month: monthNames[monthIndex],
      year,
      amount: monthApps.length * appointmentAmount * payoutPercentage,
      appointmentCount: monthApps.length
    });
  }
  
  return {
    currentMonthEarnings,
    currentMonthAppointments: currentMonthAppointments.length,
    previousMonthEarnings,
    monthlyHistory
  };
}

export default function Dashboard() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const nav = useNavigationCoordinator();
  const searchParams = useSearchParams();
  const router = useRouter();
  const paidAppointmentId = searchParams?.get("paid") || "";
  const paidSyncRef = useRef<string>("");
  const setAppointments = useAppointmentStore((s) => s.setAppointments);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const appointmentsError = useAppointmentStore((s) => s.error);
  const appointmentsLoading = useAppointmentStore((s) => s.loading);
  const authContext: DashboardUserContext = {
  userId: user?.uid ?? null,
  role: role ?? null,
  authLoading,
  };
  const vm = useDashboardViewModel(authContext);
  const effectiveRole = role ?? vm.role;
  const { getReciepesByPatientUseCase } = useDI();
  const [prescriptionCount, setPrescriptionCount] = useState<number | null>(null);
  const [appointmentsPage, setAppointmentsPage] = useState(0);

  useEffect(() => {
    if (effectiveRole !== UserRole.Patient || !user?.uid) return;
    getReciepesByPatientUseCase.execute(user.uid)
      .then((list) => setPrescriptionCount(list.length))
      .catch(() => setPrescriptionCount(null));
  }, [effectiveRole, user?.uid, getReciepesByPatientUseCase]);

  useEffect(() => {
    if (!paidAppointmentId) return;
    if (paidSyncRef.current === paidAppointmentId) return;
    paidSyncRef.current = paidAppointmentId;
    syncPaddlePaymentWithRetry(paidAppointmentId)
      .catch((error) => {
        console.warn("Payment sync after checkout failed", error);
      })
      .finally(() => {
        listAppointments()
          .then((refreshed) => setAppointments(refreshed.items))
          .catch((error) => console.warn("Appointment refresh after payment failed", error));
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete("paid");
          router.replace(url.pathname + url.search);
	        } catch {
	          router.replace(DASHBOARD_PATHS.root);
	        }
	      });
	  }, [paidAppointmentId, router, setAppointments]);

  // Show modal and join call
  const handleJoinCall = async (appointmentId: string) => {
    vm.setShowRedirecting(true);
    try {
      await vm.baseHandleJoinCall(appointmentId);
    } finally {
      vm.setShowRedirecting(false);
    }
  };

  // DashboardLayout already guards auth + role, so avoid a second full-screen loader here.
  if (!effectiveRole) return null;

  const upcoming = [...vm.filteredAppointments]
    .filter((a) => !vm.isAppointmentPast(a))
    .sort((a, b) => {
      const dateDiff = new Date(a.preferredDate).getTime() - new Date(b.preferredDate).getTime();
      if (dateDiff !== 0) return dateDiff;
      return (a.preferredTime || "").localeCompare(b.preferredTime || "");
    })
    .slice(0, 3);
  const heroAppointment = upcoming[0];
  const heroIsPaid = Boolean(heroAppointment && heroAppointment.isPaid);
  const heroAction = heroAppointment
    ? getAppointmentAction(heroAppointment, vm.isAppointmentPast, effectiveRole)
    : null;
  const heroPresentation = heroAppointment && heroAction
    ? getAppointmentActionPresentation(heroAppointment, effectiveRole, heroAction)
    : null;
  const heroIsProcessing = heroPresentation?.type === "processing";
  const heroIsWaiting = heroPresentation?.type === "waiting" || heroPresentation?.type === "disabled";
  
  // Recent Doctors (for patients)
  const recentDoctorsMap = vm.filteredAppointments
    .filter((a) => a.doctorId && effectiveRole !== UserRole.Doctor)
    .map(
      (a): RecentDoctor => ({
        id: a.doctorId,
        name: a.doctorName || "",
        specialty: a.appointmentType,
        lastVisit: a.preferredDate,
      })
    )
    .filter((d) => d.name)
    .reduce<Record<string, RecentDoctor>>((acc, doc) => {
      if (!acc[doc.id] || (acc[doc.id].lastVisit ?? "") < (doc.lastVisit ?? "")) acc[doc.id] = doc;
      return acc;
    }, {});
  const recentDoctorList = Object.values(recentDoctorsMap).slice(0, 3);
  
  // Recent Patients (for doctors)
  const recentPatientsMap = vm.filteredAppointments
    .filter((a) => a.patientId && effectiveRole === UserRole.Doctor)
    .map(
      (a): RecentPatient => ({
        id: a.patientId,
        name: a.patientName || "Patient",
        appointmentType: a.appointmentType,
        lastVisit: a.preferredDate,
      })
    )
    .filter((p) => p.name)
    .reduce<Record<string, RecentPatient>>((acc, patient) => {
      if (!acc[patient.id] || (acc[patient.id].lastVisit ?? "") < (patient.lastVisit ?? "")) acc[patient.id] = patient;
      return acc;
    }, {});
  const recentPatientList = Object.values(recentPatientsMap).slice(0, 3);
  
  // Calculate earnings for doctors
  const earningsData = effectiveRole === UserRole.Doctor && user?.uid
    ? calculateMonthlyEarnings(vm.filteredAppointments, user.uid, effectiveRole)
    : null;

  // Patient KPI data — with spark (last 7 months visit counts) + deltas
  const now = new Date();
  const monthlyVisitCounts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    return vm.filteredAppointments.filter((a) => {
      const ad = new Date(a.preferredDate);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    }).length;
  });
  const prevMonthVisits = monthlyVisitCounts[5] ?? 0;
  const currMonthVisits = monthlyVisitCounts[6] ?? 0;
  const visitDelta = currMonthVisits - prevMonthVisits;

  const pendingNow = vm.filteredAppointments.filter(
    (a) => (a.status || '').toLowerCase() === 'pending' ||
      ((a.status || '').toLowerCase() === 'accepted' && !a.isPaid)
  ).length;

  const patientKpiData: PatientKpiData = {
    upcomingVisits: vm.filteredAppointments.filter(
      (a) => !vm.isAppointmentPast(a) && !isCanceledOrRejectedStatus(a.status)
    ).length,
    prescriptions: prescriptionCount,
    totalVisits: vm.filteredAppointments.length,
    pendingActions: pendingNow,
    spark: {
      upcomingVisits: monthlyVisitCounts,
      prescriptions: monthlyVisitCounts.map((v) => Math.max(0, v - 1)),
      totalVisits: monthlyVisitCounts.map((_, i, arr) => arr.slice(0, i + 1).reduce((s, x) => s + x, 0)),
      pendingActions: monthlyVisitCounts,
    },
    delta: {
      upcomingVisits: visitDelta !== 0 ? `${visitDelta > 0 ? '+' : '−'}${Math.abs(visitDelta)} this month` : null,
      prescriptions: null,
      totalVisits: visitDelta !== 0 ? `${visitDelta > 0 ? '+' : '−'}${Math.abs(visitDelta)} this month` : null,
      pendingActions: pendingNow > 0 ? `${pendingNow} pending` : null,
    },
  };

  const sortedDashboardAppointments = sortAppointments(vm.filteredAppointments, vm.filteredAppointments.length);
  const appointmentsTotalPages = Math.max(1, Math.ceil(sortedDashboardAppointments.length / DASHBOARD_APPOINTMENTS_PAGE_SIZE));
  useEffect(() => {
    if (appointmentsPage > appointmentsTotalPages - 1) setAppointmentsPage(0);
  }, [appointmentsPage, appointmentsTotalPages]);

  return (
    <RequestStateGate
      loading={authLoading || (appointmentsLoading && vm.filteredAppointments.length === 0)}
      error={appointmentsError}
      onRetry={() => {
        if (effectiveRole) fetchAppointments(effectiveRole);
      }}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      analyticsPrefix="dashboard"
    >
      {user?.uid ? <DashboardTutorialGate userId={user.uid} role={effectiveRole} /> : null}
      <div>
        <RedirectingModal show={vm.showRedirecting} />
        <div className="space-y-4">
          <ProfileWarning show={!vm.loading && vm.profileIncomplete} />

          {effectiveRole === UserRole.Patient ? (
            /* ── PATIENT enterprise layout ── */
            <>
              {/* 1. KPI row */}
              <PatientKpiCards
                data={patientKpiData}
                loading={appointmentsLoading && vm.filteredAppointments.length === 0}
              />

              {/* 2. Hero + Activity feed */}
              <div className="grid gap-3 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  {heroAppointment ? (
                    <HeroCard
                      title={heroAppointment.doctorName || t("yourNextConsultation") || "Your next consultation"}
                      subtitle={heroAppointment.appointmentType || t("stayPrepared") || "Stay prepared for your upcoming session"}
                      helper={`${t("consultation") || "Consultation"} • ${heroAppointment.preferredDate ?? (t("today") || "Today")}`}
                      onJoin={heroPresentation?.type === "join" ? () => handleJoinCall(heroAppointment.id) : undefined}
                      onPay={heroPresentation?.type === "pay" ? () => vm.handlePayNow(heroAppointment.id, APPOINTMENT_PRICE_EUR) : undefined}
                      isPaid={heroIsPaid}
                      isProcessing={heroIsProcessing}
                      isWaiting={heroIsWaiting}
                      onViewProfile={heroAppointment.doctorId ? () => nav.toDoctorProfile(heroAppointment.doctorId) : undefined}
                      ctaLabel={t("joinNow") || "Join now"}
                      payLabel={t("payNow") || "Pay now"}
                      processingLabel={(heroPresentation?.type === "processing" ? t(heroPresentation.label) : t("paymentProcessing")) || "Processing payment"}
                      waitingLabel={(heroIsWaiting && heroPresentation ? t(heroPresentation.label) : t("waitingForAcceptance")) || "Waiting for approval"}
                      profileLabel={t("viewDoctor") || "View doctor"}
                    />
                  ) : (
                    <HeroCard
                      title={t("noUpcomingTitle") || "When was your last visit?"}
                      subtitle={t("noUpcomingSubtitle") || "Stay on top of your health—book a quick consultation now."}
                      helper={t("noUpcomingHelper") || "Secure telemedicine on pyetdoktorin.al"}
                      onJoin={() => nav.toNewAppointment()}
                      ctaLabel={t("bookNow") || "Book now"}
                    />
                  )}
                </div>
                <div className="lg:col-span-1">
                  <PatientQuickActions />
                </div>
              </div>

              {/* 3. Appointments table + Activity + Recent Doctors */}
              <div className="grid gap-3 lg:grid-cols-3 items-start">
                <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
                    <h2 className="text-[13.5px] font-bold text-gray-900">{t("yourAppointments")}</h2>
                    <Link href={DASHBOARD_PATHS.appointments} className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800">
                      {t("viewAll")}
                    </Link>
                  </div>
                  <AppointmentsTable
                    appointments={sortedDashboardAppointments.slice(
                      appointmentsPage * DASHBOARD_APPOINTMENTS_PAGE_SIZE,
                      appointmentsPage * DASHBOARD_APPOINTMENTS_PAGE_SIZE + DASHBOARD_APPOINTMENTS_PAGE_SIZE
                    )}
                    role={effectiveRole}
                    isAppointmentPast={vm.isAppointmentPast}
                    handleJoinCall={handleJoinCall}
                    handlePayNow={vm.handlePayNow}
                    maxRows={DASHBOARD_APPOINTMENTS_PAGE_SIZE}
                    variant="embedded"
                  />
                  {appointmentsTotalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setAppointmentsPage((p) => Math.max(0, p - 1))}
                        disabled={appointmentsPage === 0}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11.5px] font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                      >
                        {t("previous") || "Previous"}
                      </button>
                      <span className="text-[11.5px] text-gray-500">
                        {t("page") || "Page"} {appointmentsPage + 1} / {appointmentsTotalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() => setAppointmentsPage((p) => Math.min(appointmentsTotalPages - 1, p + 1))}
                        disabled={appointmentsPage >= appointmentsTotalPages - 1}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11.5px] font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                      >
                        {t("next") || "Next"}
                      </button>
                    </div>
                  )}
                </section>

                <div className="flex flex-col gap-3">
                  <NotificationCard appointments={vm.filteredAppointments} />

                  <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[12.5px] font-bold text-gray-900">{t("recentDoctors") ?? "Recent doctors"}</p>
                    </div>
                    <RecentDoctorsList doctors={recentDoctorList} />
                  </section>
                  <CheckupReminderCard />
                </div>
              </div>
            </>
          ) : (
            /* ── DOCTOR layout (unchanged) ── */
            <>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {heroAppointment ? (
                    <HeroCard
                      title={heroAppointment.patientName || t("yourNextConsultation") || "Your next consultation"}
                      subtitle={heroAppointment.appointmentType || t("stayPrepared") || "Stay prepared for your upcoming session"}
                      helper={`${t("consultation") || "Consultation"} • ${heroAppointment.preferredDate ?? (t("today") || "Today")}`}
                      onJoin={heroPresentation?.type === "join" ? () => handleJoinCall(heroAppointment.id) : undefined}
                      onPay={heroPresentation?.type === "pay" ? () => vm.handlePayNow(heroAppointment.id, APPOINTMENT_PRICE_EUR) : undefined}
                      isPaid={heroIsPaid}
                      isProcessing={heroIsProcessing}
                      isWaiting={heroIsWaiting}
                      ctaLabel={t("joinNow") || "Join now"}
                      payLabel={t("payNow") || "Pay now"}
                      processingLabel={(heroPresentation?.type === "processing" ? t(heroPresentation.label) : t("paymentProcessing")) || "Processing payment"}
                      waitingLabel={(heroIsWaiting && heroPresentation ? t(heroPresentation.label) : t("waitingForAcceptance")) || "Waiting for approval"}
                      profileLabel={t("viewDoctor") || "View doctor"}
                    />
                  ) : (
                    <HeroCard
                      title={t("noUpcomingDoctorTitle") || "No upcoming consultations"}
                      subtitle={t("noUpcomingDoctorSubtitle") || "Your schedule is clear for now."}
                      helper={t("noUpcomingHelper") || "Secure telemedicine on pyetdoktorin.al"}
                    />
                  )}
                  <DoctorQuickActionsCard appointments={vm.filteredAppointments} />
                </div>
                <div className="lg:col-span-1">
                  <NotificationCard appointments={vm.filteredAppointments} />
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <section className="card-premium card-premium-hover card-accent card-accent-purple p-4 sm:p-5 h-full flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-gray-900">{t("recentPatients") ?? "Recent Patients"}</p>
                  </div>
                  <div className="flex-1">
                    <RecentPatientsList patients={recentPatientList} />
                  </div>
                </section>

                {earningsData ? (
                  <DoctorEarningsCard
                    currentMonthEarnings={earningsData.currentMonthEarnings}
                    currentMonthAppointments={earningsData.currentMonthAppointments}
                    previousMonthEarnings={earningsData.previousMonthEarnings}
                    monthlyHistory={earningsData.monthlyHistory}
                  />
                ) : null}

                <section className="card-premium card-premium-hover card-accent card-accent-violet p-4 sm:p-5 h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t("visits") ?? "Visits"}</p>
                      <p className="text-4xl font-extrabold mt-1 text-purple-700">{vm.totalAppointments}</p>
                      <p className="text-xs text-gray-600">{t("lastMonth") ?? "last month"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-purple-100/80 bg-purple-50/70 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-purple-600 font-semibold">{t("pendingActions") ?? "Pending actions"}</p>
                      <p className="text-lg font-semibold text-purple-800">
                        {vm.filteredAppointments.filter((a) => a.status?.toLowerCase?.() === "pending").length}
                      </p>
                      <p className="text-[11px] text-purple-700/80">{t("pendingActionsCopy") ?? "Awaiting confirmation or payment."}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-200/70 bg-white/60 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-wide text-gray-600 font-semibold">{t("upcoming") ?? "Upcoming"}</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {vm.filteredAppointments.filter((a) => !vm.isAppointmentPast(a)).length}
                      </p>
                      <p className="text-[11px] text-gray-600">{t("upcomingCopy") ?? "Including today and future visits."}</p>
                    </div>
                  </div>
                </section>
              </div>

              <section className="card-premium card-accent card-accent-slate overflow-hidden">
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                  <h2 className="text-base font-semibold text-gray-900">{t("yourAppointments")}</h2>
                  <Link href={DASHBOARD_PATHS.appointments} className="text-xs font-semibold text-purple-700 hover:text-purple-800">
                    {t("viewAll")}
                  </Link>
                </div>
                <AppointmentsTable
                  appointments={vm.filteredAppointments}
                  role={effectiveRole}
                  isAppointmentPast={vm.isAppointmentPast}
                  handleJoinCall={handleJoinCall}
                  handlePayNow={vm.handlePayNow}
                  maxRows={5}
                  variant="embedded"
                />
              </section>
            </>
          )}
        </div>
      </div>
    </RequestStateGate>
  );
}

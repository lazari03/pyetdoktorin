
"use client";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import Loader from "@/presentation/components/Loader/Loader";
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
import { EmergencyCard } from "@/presentation/components/dashboard/EmergencyCard";
import { BmiCalculatorCard } from "@/presentation/components/dashboard/BmiCalculatorCard";
import { useNavigationCoordinator } from "@/navigation/NavigationCoordinator";
import { UserRole } from "@/domain/entities/UserRole";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import { isCompletedStatus } from "@/presentation/utils/appointmentStatus";
import { getAppointmentAction } from "@/presentation/utils/getAppointmentAction";
import { getAppointmentActionPresentation } from "@/presentation/utils/getAppointmentActionPresentation";
import { APPOINTMENT_PRICE_EUR, DOCTOR_PAYOUT_RATE } from "@/config/paywallConfig";
import { syncPaddlePaymentWithRetry } from "@/network/payments";
import { listAppointments } from "@/network/appointments";
import { useAppointmentStore } from "@/store/appointmentStore";
import { useEffect, useRef } from "react";

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
  const authContext: DashboardUserContext = {
  userId: user?.uid ?? null,
  role: role ?? null,
  authLoading,
  };
  const vm = useDashboardViewModel(authContext);

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

  // Render the dashboard as soon as role is known so the hero CTA doesn't disappear behind a full-screen loader.
  if (!vm.role) return <Loader />;

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
    ? getAppointmentAction(heroAppointment, vm.isAppointmentPast, vm.role)
    : null;
  const heroPresentation = heroAppointment && heroAction
    ? getAppointmentActionPresentation(heroAppointment, vm.role, heroAction)
    : null;
  const heroIsProcessing = heroPresentation?.type === "processing";
  const heroIsWaiting = heroPresentation?.type === "waiting" || heroPresentation?.type === "disabled";
  
  // Recent Doctors (for patients)
  const recentDoctorsMap = vm.filteredAppointments
    .filter((a) => a.doctorId && role !== UserRole.Doctor)
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
    .filter((a) => a.patientId && role === UserRole.Doctor)
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
  const earningsData = role === UserRole.Doctor && user?.uid
    ? calculateMonthlyEarnings(vm.filteredAppointments, user.uid, role)
    : null;

  return (
    <div className="min-h-screen">
      <RedirectingModal show={vm.showRedirecting} />
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10 space-y-6">
        <ProfileWarning show={!vm.loading && vm.profileIncomplete} />
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left column: Hero + Emergency/BMI stacked */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {heroAppointment ? (
              <HeroCard
                title={
                  role === UserRole.Doctor
                    ? heroAppointment.patientName || t("yourNextConsultation") || "Your next consultation"
                    : heroAppointment.doctorName || t("yourNextConsultation") || "Your next consultation"
                }
                subtitle={heroAppointment.appointmentType || t("stayPrepared") || "Stay prepared for your upcoming session"}
                helper={`${t("consultation") || "Consultation"} • ${heroAppointment.preferredDate ?? (t("today") || "Today")}`}
                onJoin={
                  heroPresentation?.type === "join"
                    ? () => handleJoinCall(heroAppointment.id)
                    : undefined
                }
                onPay={
                  heroPresentation?.type === "pay"
                    ? () => vm.handlePayNow(heroAppointment.id, APPOINTMENT_PRICE_EUR)
                    : undefined
                }
                isPaid={heroIsPaid}
                isProcessing={heroIsProcessing}
                isWaiting={heroIsWaiting}
                onViewProfile={
                  role === UserRole.Patient && heroAppointment.doctorId
                    ? () => nav.toDoctorProfile(heroAppointment.doctorId)
                    : undefined
                }
                ctaLabel={t("joinNow") || "Join now"}
                payLabel={t("payNow") || "Pay now"}
                processingLabel={
                  (heroPresentation?.type === "processing"
                    ? t(heroPresentation.label)
                    : t("paymentProcessing")) || "Processing payment"
                }
                waitingLabel={
                  (heroIsWaiting && heroPresentation
                    ? t(heroPresentation.label)
                    : t("waitingForAcceptance")) || "Waiting for approval"
                }
                profileLabel={t("viewDoctor") || "View doctor"}
              />
            ) : (
              <HeroCard
                title={
                  role === UserRole.Doctor
                    ? t("noUpcomingDoctorTitle") || "No upcoming consultations"
                    : t("noUpcomingTitle") || "When was your last visit?"
                }
                subtitle={
                  role === UserRole.Doctor
                    ? t("noUpcomingDoctorSubtitle") || "Your schedule is clear for now."
                    : t("noUpcomingSubtitle") || "Stay on top of your health—book a quick consultation now."
                }
	                helper={t("noUpcomingHelper") || "Secure telemedicine on pyetdoktorin.al"}
	                onJoin={role === UserRole.Doctor ? undefined : () => nav.toNewAppointment()}
	                ctaLabel={role === UserRole.Doctor ? undefined : (t("bookNow") || "Book now")}
	              />
            )}

            {/* Emergency & BMI directly under the hero card */}
            {role === UserRole.Patient && (
              <div className="grid gap-4 sm:grid-cols-2">
                <EmergencyCard />
                <BmiCalculatorCard />
              </div>
            )}
          </div>

          {/* Right column: Notifications */}
          <div className="lg:col-span-1">
            <NotificationCard appointments={vm.filteredAppointments} />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Recent Doctors/Patients Section */}
          <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-900">
                {role === UserRole.Doctor 
                  ? (t("recentPatients") ?? "Recent Patients")
                  : (t("recentDoctors") ?? "Recent doctors")
                }
              </p>
            </div>
            <div className="flex-1">
              {role === UserRole.Doctor ? (
                <RecentPatientsList patients={recentPatientList} />
              ) : (
                <RecentDoctorsList doctors={recentDoctorList} />
              )}
            </div>
          </section>

          {/* Checkup Reminder (patients) or Earnings (doctors) */}
          {role === UserRole.Doctor && earningsData ? (
            <DoctorEarningsCard
              currentMonthEarnings={earningsData.currentMonthEarnings}
              currentMonthAppointments={earningsData.currentMonthAppointments}
              previousMonthEarnings={earningsData.previousMonthEarnings}
              monthlyHistory={earningsData.monthlyHistory}
            />
          ) : (
            <CheckupReminderCard />
          )}

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
          </section>
        </div>

        <section className="bg-white rounded-3xl shadow-lg p-4 border border-purple-50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">
              {t("yourAppointments")}
            </h2>
	            <Link href={DASHBOARD_PATHS.appointments} className="text-xs text-purple-600 hover:underline">
	              {t("viewAll")}
	            </Link>
	          </div>
          <AppointmentsTable
            appointments={vm.filteredAppointments}
            role={vm.role}
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

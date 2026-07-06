"use client";

import { useTranslation } from "react-i18next";
import { APPOINTMENT_PRICE_CURRENCY, APPOINTMENT_PRICE_EUR, DOCTOR_PAYOUT_PERCENTAGE, DOCTOR_PAYOUT_RATE } from "@/config/paywallConfig";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import { ArrowLeftIcon, BanknotesIcon, CalendarIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";
import { UserRole } from "@/domain/entities/UserRole";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import { isCompletedStatus } from "@/presentation/utils/appointmentStatus";
import { useAppointmentStore } from "@/store/appointmentStore";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from "@/presentation/components/Skeleton/StatsPageSkeleton";


// Helper function to calculate earnings data
function calculateEarningsData(appointments: Array<{ doctorId: string; status?: string; isPaid: boolean; preferredDate: string }>, userId: string) {
  const payoutPercentage = DOCTOR_PAYOUT_RATE;
  const appointmentAmount = APPOINTMENT_PRICE_EUR;
  
  // Filter completed/paid appointments for this doctor
  const doctorAppointments = appointments.filter(a =>
    a.doctorId === userId &&
    isCompletedStatus(a.status) &&
    a.isPaid
  );
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Current month earnings
  const currentMonthApps = doctorAppointments.filter(a => {
    const appDate = new Date(a.preferredDate);
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  });
  
  const currentMonthEarnings = currentMonthApps.length * appointmentAmount * payoutPercentage;
  
  // Previous month earnings
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousMonthApps = doctorAppointments.filter(a => {
    const appDate = new Date(a.preferredDate);
    return appDate.getMonth() === prevMonth && appDate.getFullYear() === prevYear;
  });
  
  const previousMonthEarnings = previousMonthApps.length * appointmentAmount * payoutPercentage;
  
  // Total earnings
  const totalEarnings = doctorAppointments.length * appointmentAmount * payoutPercentage;
  const totalAppointments = doctorAppointments.length;
  
  // Monthly breakdown for last 12 months
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const monthlyData = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = currentMonth - i < 0 ? 12 + (currentMonth - i) : currentMonth - i;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    
    const monthApps = doctorAppointments.filter(a => {
      const appDate = new Date(a.preferredDate);
      return appDate.getMonth() === monthIndex && appDate.getFullYear() === year;
    });
    
    const monthEarnings = monthApps.length * appointmentAmount * payoutPercentage;
    
    // Calculate comparison with previous month
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1;
    const prevMonthYear = monthIndex === 0 ? year - 1 : year;
    const prevMonthApps = doctorAppointments.filter(a => {
      const appDate = new Date(a.preferredDate);
      return appDate.getMonth() === prevMonthIndex && appDate.getFullYear() === prevMonthYear;
    });
    const prevMonthEarnings = prevMonthApps.length * appointmentAmount * payoutPercentage;
    
    const percentageChange = prevMonthEarnings > 0 
      ? ((monthEarnings - prevMonthEarnings) / prevMonthEarnings) * 100 
      : 0;
    
    monthlyData.push({
      month: monthNames[monthIndex],
      year,
      earnings: monthEarnings,
      appointments: monthApps.length,
      percentageChange,
      isIncrease: percentageChange > 0,
      isDecrease: percentageChange < 0
    });
  }
  
  return {
    currentMonthEarnings,
    currentMonthAppointments: currentMonthApps.length,
    previousMonthEarnings,
    totalEarnings,
    totalAppointments,
    monthlyData
  };
}

export default function EarningsPage() {
  const { t } = useTranslation();
  const { user, role, loading: authLoading } = useAuth();
  const { error: appointmentError, fetchAppointments } = useAppointmentStore();

  const authContext: DashboardUserContext = {
    userId: user?.uid ?? null,
    role: role ?? null,
    authLoading,
  };
  
  const vm = useDashboardViewModel(authContext);
  
  const earningsData = useMemo(() => {
    if (!user?.uid || !vm.filteredAppointments) return null;
    return calculateEarningsData(vm.filteredAppointments, user.uid);
  }, [user?.uid, vm.filteredAppointments]);
  
  // Only doctors can access this page
  if (role !== UserRole.Doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t("accessDenied") || "Access denied"}</p>
          <Link href={DASHBOARD_PATHS.root} className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800 mt-2 inline-block">
            {t("backToDashboard") || "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <RequestStateGate
      loading={authLoading || vm.loading || !earningsData}
      error={appointmentError}
      onRetry={() => {
        if (role) fetchAppointments(role);
      }}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      analyticsPrefix="earnings"
      skeleton={<StatsPageSkeleton cardCount={3} />}
    >
      {earningsData ? (
        <div>
          <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href={DASHBOARD_PATHS.root}
            className="p-2 rounded-lg bg-white border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-[15px] font-bold text-gray-900">
              {t("earningsHistory") || "Earnings History"}
            </h1>
            <p className="text-[12.5px] text-gray-500">
              {t("trackYourEarnings") || "Track your earnings and performance"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-3 md:grid-cols-3">
          {/* Total Earnings */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{t("totalEarnings") || "Total Earnings"}</p>
              <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                <BanknotesIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold leading-none text-gray-900">
              ${earningsData.totalEarnings.toFixed(2)}
            </p>
          </div>

          {/* Current Month */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{t("thisMonth") || "This Month"}</p>
              <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-teal-100 text-teal-600">
                <CalendarIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold leading-none text-teal-700">
              ${earningsData.currentMonthEarnings.toFixed(2)}
            </p>
          </div>

          {/* Total Appointments */}
          <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{t("appointmentsInTotal") || "Appointments in total"}</p>
              <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                <CalendarIcon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold leading-none text-gray-900">
              {earningsData.totalAppointments}
            </p>
            <p className="text-[11px] text-gray-400 leading-none">
              {t("allTime") || "All time"}
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-[13.5px] font-bold text-gray-900">
              {t("monthlyBreakdown") || "Monthly Breakdown"}
            </h2>
            <p className="text-[11.5px] text-gray-500">
              {t("earningsByMonth") || "Your earnings breakdown by month"}
            </p>
          </div>

          <div className="divide-y divide-gray-50">
            {earningsData.monthlyData.map((month, index) => (
              <div key={`${month.month}-${month.year}`} className="p-4 flex items-center justify-between hover:bg-gray-50/60 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-bold text-purple-700">
                      {month.month.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[12.5px] font-semibold text-gray-900">
                      {month.month} {month.year}
                    </p>
                    <p className="text-[10.5px] text-gray-400">
                      {month.appointments} {t("appointments") || "appointments"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[13px] font-bold text-gray-900">
                    ${month.earnings.toFixed(2)}
                  </p>
                  {index > 0 && month.percentageChange !== 0 && (
                    <p className={`text-[10.5px] font-semibold ${month.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                      {month.isIncrease ? '↑' : '↓'} {Math.abs(month.percentageChange).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-[12px] text-blue-800">
            <strong>{t("note") || "Note"}:</strong>{" "}
            {t("earningsInfo") ||
              `You receive ${DOCTOR_PAYOUT_PERCENTAGE}% of each appointment fee (${APPOINTMENT_PRICE_CURRENCY} ${APPOINTMENT_PRICE_EUR}). Earnings are calculated based on completed and paid appointments only.`}
          </p>
        </div>
      </div>
    </div>
      ) : null}
    </RequestStateGate>
  );
}

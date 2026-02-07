"use client";

import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDashboardViewModel, DashboardUserContext } from "@/presentation/view-models/userDashboardViewModel";
import Loader from "@/presentation/components/Loader/Loader";
import { ArrowLeftIcon, BanknotesIcon, CalendarIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useMemo } from "react";


// Helper function to calculate earnings data
function calculateEarningsData(appointments: Array<{ doctorId: string; status?: string; isPaid: boolean; preferredDate: string }>, userId: string) {
  const payoutPercentage = 0.70; // 70% to doctor
  const appointmentAmount = 13; // $13 per appointment
  
  // Filter completed/paid appointments for this doctor
  const doctorAppointments = appointments.filter(a => 
    a.doctorId === userId && 
    a.status?.toLowerCase() === "completed" && 
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
  
  if (authLoading || vm.loading) return <Loader />;
  
  // Only doctors can access this page
  if (role !== 'doctor') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t("accessDenied") || "Access denied"}</p>
          <Link href="/dashboard" className="text-purple-600 hover:underline mt-2 inline-block">
            {t("backToDashboard") || "Back to Dashboard"}
          </Link>
        </div>
      </div>
    );
  }
  
  if (!earningsData) return <Loader />;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard" 
            className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t("earningsHistory") || "Earnings History"}
            </h1>
            <p className="text-sm text-gray-600">
              {t("trackYourEarnings") || "Track your earnings and performance"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BanknotesIcon className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">{t("totalEarnings") || "Total Earnings"}</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${earningsData.totalEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {earningsData.totalAppointments} {t("appointments") || "appointments"}
            </p>
          </div>

          {/* Current Month */}
          <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl shadow-md p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-white" />
              </div>
              <p className="text-sm text-white/80">{t("thisMonth") || "This Month"}</p>
            </div>
            <p className="text-3xl font-bold">
              ${earningsData.currentMonthEarnings.toFixed(2)}
            </p>
            <p className="text-xs text-white/70 mt-1">
              {earningsData.currentMonthAppointments} {t("appointments") || "appointments"}
            </p>
          </div>

          {/* Month-over-Month Change */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-purple-50">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${
                earningsData.currentMonthEarnings >= earningsData.previousMonthEarnings 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                {earningsData.currentMonthEarnings >= earningsData.previousMonthEarnings ? (
                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">{t("vsLastMonth") || "vs Last Month"}</p>
            </div>
            <p className={`text-3xl font-bold ${
              earningsData.currentMonthEarnings >= earningsData.previousMonthEarnings 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {earningsData.previousMonthEarnings > 0 
                ? `${((Math.abs(earningsData.currentMonthEarnings - earningsData.previousMonthEarnings) / earningsData.previousMonthEarnings) * 100).toFixed(1)}%`
                : "N/A"
              }
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {earningsData.currentMonthEarnings >= earningsData.previousMonthEarnings 
                ? (t("increase") || "Increase")
                : (t("decrease") || "Decrease")
              }
            </p>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-2xl shadow-md border border-purple-50 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("monthlyBreakdown") || "Monthly Breakdown"}
            </h2>
            <p className="text-sm text-gray-600">
              {t("earningsByMonth") || "Your earnings breakdown by month"}
            </p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {earningsData.monthlyData.map((month, index) => (
              <div key={`${month.month}-${month.year}`} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">
                      {month.month.slice(0, 3)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {month.month} {month.year}
                    </p>
                    <p className="text-sm text-gray-500">
                      {month.appointments} {t("appointments") || "appointments"}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">
                    ${month.earnings.toFixed(2)}
                  </p>
                  {index > 0 && month.percentageChange !== 0 && (
                    <p className={`text-xs ${month.isIncrease ? 'text-green-600' : 'text-red-600'}`}>
                      {month.isIncrease ? '↑' : '↓'} {Math.abs(month.percentageChange).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-sm text-blue-800">
            <strong>{t("note") || "Note"}:</strong> {t("earningsInfo") || "You receive 70% of each appointment fee ($13). Earnings are calculated based on completed and paid appointments only."}
          </p>
        </div>
      </div>
    </div>
  );
}

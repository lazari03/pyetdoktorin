import React from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { DASHBOARD_PATHS } from "@/navigation/paths";

export type MonthlyEarning = {
  month: string;
  year: number;
  amount: number;
  appointmentCount: number;
};

type Props = {
  currentMonthEarnings: number;
  currentMonthAppointments: number;
  previousMonthEarnings: number;
  monthlyHistory: MonthlyEarning[];
};

export function DoctorEarningsCard({
  currentMonthEarnings,
  currentMonthAppointments,
  previousMonthEarnings,
  monthlyHistory,
}: Props) {
  const { t } = useTranslation();
  
  // Calculate percentage change
  const percentageChange = previousMonthEarnings > 0
    ? ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100
    : 0;
  
  const isIncrease = percentageChange > 0;
  const isDecrease = percentageChange < 0;
  
  // Sort monthly history by date (most recent first)
  const sortedHistory = [...monthlyHistory].sort((a, b) => {
    const dateA = new Date(a.year, getMonthIndex(a.month));
    const dateB = new Date(b.year, getMonthIndex(b.month));
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <section className="bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col">
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-900">{t("monthlyEarnings") || "Monthly Earnings"}</p>
        <p className="text-xs text-gray-600 mt-1">
          {t("trackYourIncome") || "Track your income and performance"}
        </p>
      </div>

      {/* Current Month Stats */}
      <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-4 text-white mb-4">
        <p className="text-xs text-white/80">{t("thisMonth") || "This Month"}</p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-bold">${currentMonthEarnings.toFixed(2)}</span>
          {currentMonthAppointments > 0 && (
            <span className="text-xs text-white/70">
              ({currentMonthAppointments} {t("appointments") || "appointments"})
            </span>
          )}
        </div>
        {percentageChange !== 0 && (
          <div className={`mt-2 text-xs font-medium ${isIncrease ? 'text-green-300' : isDecrease ? 'text-red-300' : 'text-white/70'}`}>
            {isIncrease ? '↑' : isDecrease ? '↓' : '•'} {Math.abs(percentageChange).toFixed(1)}% {t("vsLastMonth") || "vs last month"}
          </div>
        )}
      </div>

      {/* Monthly History */}
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-semibold text-gray-700 mb-2">{t("pastMonths") || "Past Months"}</p>
        <div className="space-y-2 max-h-[120px] overflow-y-auto">
          {sortedHistory.slice(0, 6).map((month) => (
            <div key={`${month.month}-${month.year}`} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{month.month} {month.year}</p>
                <p className="text-xs text-gray-500">{month.appointmentCount} {t("appointments") || "appointments"}</p>
              </div>
              <span className="text-sm font-semibold text-purple-600">${month.amount.toFixed(2)}</span>
            </div>
          ))}
          {sortedHistory.length === 0 && (
            <p className="text-xs text-gray-500 italic">{t("noEarningsHistory") || "No earnings history yet"}</p>
          )}
        </div>
      </div>

      {/* See All Button */}
      <Link
        href={DASHBOARD_PATHS.earnings}
        className="mt-4 w-full text-center py-3 px-4 rounded-xl bg-purple-50 text-purple-600 text-sm font-semibold hover:bg-purple-100 transition-colors"
      >
        {t("viewAllEarnings") || "Shiko te gjitha"}
      </Link>
    </section>
  );
}

function getMonthIndex(monthName: string): number {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months.indexOf(monthName);
}

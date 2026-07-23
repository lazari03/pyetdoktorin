"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import "@i18n";
import { BanknotesIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from "@/presentation/components/Skeleton/StatsPageSkeleton";
import { usePayoutSummary } from "@/presentation/hooks/usePayoutSummary";
import { markDoctorPayoutsPaid } from "@/network/payouts";
import { useToast } from "@/presentation/components/Toast/ToastProvider";

function money(amount: number, currency: string) {
  return `${currency} ${amount.toFixed(2)}`;
}

export default function AdminPayoutsPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data, error, isLoading, mutate } = usePayoutSummary();
  const [payingDoctorId, setPayingDoctorId] = useState<string | null>(null);

  const handleMarkPaid = async (doctorId: string) => {
    setPayingDoctorId(doctorId);
    try {
      await markDoctorPayoutsPaid(doctorId);
      await mutate();
      toast({ variant: "success", message: t("payoutMarkedPaid") || "Marked as paid." });
    } catch {
      toast({ variant: "error", message: t("payoutMarkPaidFailed") || "Failed to update payout status." });
    } finally {
      setPayingDoctorId(null);
    }
  };

  return (
    <RequestStateGate
      loading={isLoading}
      error={error}
      onRetry={() => mutate()}
      loadingLabel={t("loading")}
      analyticsPrefix="admin.payouts"
      skeleton={<StatsPageSkeleton cardCount={3} />}
    >
      {data ? (
        <div className="space-y-3">
          <div>
            <h1 className="text-[15px] font-bold text-gray-900">{t("payouts") || "Payouts"}</h1>
            <p className="text-[12.5px] text-gray-500">
              {t("payoutsSubtitle") ||
                `Doctors keep ${data.doctorPayoutPercentage}% of each paid appointment fee; the rest is your platform commission.`}
            </p>
          </div>

          {/* Summary cards */}
          <section className="grid gap-3 md:grid-cols-3">
            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  {t("totalCollected") || "Total collected"}
                </p>
                <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                  <BanknotesIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-3xl font-bold leading-none text-gray-900">
                {money(data.totals.totalAmount, data.currency)}
              </p>
              <p className="text-[11px] text-gray-400 leading-none">
                {t("allTime") || "All time"}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  {t("owedToDoctors") || "Owed to doctors"}
                </p>
                <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-amber-100 text-amber-600">
                  <BanknotesIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-3xl font-bold leading-none text-amber-700">
                {money(data.totals.pendingAmount, data.currency)}
              </p>
              <p className="text-[11px] text-gray-400 leading-none">
                {t("pendingPayout") || "Not yet paid out"}
              </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                  {t("platformCommission") || "Your commission held"}
                </p>
                <span className="h-7 w-7 rounded-lg flex items-center justify-center bg-teal-100 text-teal-600">
                  <BanknotesIcon className="h-4 w-4" />
                </span>
              </div>
              <p className="text-3xl font-bold leading-none text-teal-700">
                {money(data.totals.platformFee, data.currency)}
              </p>
              <p className="text-[11px] text-gray-400 leading-none">
                {data.doctorPayoutPercentage}% {t("goesToDoctorsRestIsYours") || "goes to doctors, the rest is yours"}
              </p>
            </div>
          </section>

          {/* Per-doctor breakdown */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-[13.5px] font-bold text-gray-900">
                {t("payoutsByDoctor") || "Payouts by doctor"}
              </h2>
              <p className="text-[11.5px] text-gray-500">
                {t("payoutsByDoctorSubtitle") || "What each doctor is owed, and what you keep."}
              </p>
            </div>

            {data.doctors.length === 0 ? (
              <p className="p-6 text-center text-[12.5px] text-gray-500">
                {t("noPayoutsYet") || "No paid appointments yet."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10.5px] uppercase tracking-wide text-gray-400">
                      <th className="px-4 py-2.5 font-semibold">{t("doctor") || "Doctor"}</th>
                      <th className="px-4 py-2.5 font-semibold text-right">{t("total") || "Total"}</th>
                      <th className="px-4 py-2.5 font-semibold text-right">
                        {t("doctorShare") || "Doctor"} ({data.doctorPayoutPercentage}%)
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-right">
                        {t("platformShare") || "Platform"} ({100 - data.doctorPayoutPercentage}%)
                      </th>
                      <th className="px-4 py-2.5 font-semibold text-right">{t("pending") || "Pending"}</th>
                      <th className="px-4 py-2.5 font-semibold text-right">{t("paid") || "Paid"}</th>
                      <th className="px-4 py-2.5 font-semibold text-right">{t("actions") || "Actions"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.doctors.map((doctor) => (
                      <tr key={doctor.doctorId} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{doctor.doctorName}</td>
                        <td className="px-4 py-3 text-right text-gray-700">
                          {money(doctor.totalAmount, doctor.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                          {money(doctor.payoutAmount, doctor.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-teal-700 font-semibold">
                          {money(doctor.platformFee, doctor.currency)}
                        </td>
                        <td className="px-4 py-3 text-right text-amber-700 font-semibold">
                          {money(doctor.pendingAmount, doctor.currency)}
                          {doctor.pendingCount > 0 && (
                            <span className="ml-1 text-[10.5px] text-gray-400">({doctor.pendingCount})</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {money(doctor.paidAmount, doctor.currency)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {doctor.pendingCount > 0 ? (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(doctor.doctorId)}
                              disabled={payingDoctorId === doctor.doctorId}
                              className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 px-3 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <CheckCircleIcon className="h-3.5 w-3.5" />
                              {payingDoctorId === doctor.doctorId
                                ? (t("marking") || "Marking...")
                                : (t("markAsPaid") || "Mark as paid")}
                            </button>
                          ) : (
                            <span className="text-[11px] text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-[12px] text-blue-800">
              <strong>{t("note") || "Note"}:</strong>{" "}
              {t("payoutsHoldNote") ||
                "Patient payments land in your own account in full. This page only tracks what you owe each doctor — actually paying them (bank transfer, etc.) is a separate manual step. Use \"Mark as paid\" once you've sent it."}
            </p>
          </div>
        </div>
      ) : null}
    </RequestStateGate>
  );
}

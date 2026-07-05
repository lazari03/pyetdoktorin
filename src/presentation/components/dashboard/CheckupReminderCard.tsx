import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCheckupReminder } from "@/presentation/hooks/useCheckupReminder";

type Props = {
  className?: string;
};

export function CheckupReminderCard({ className = "" }: Props) {
  const { t } = useTranslation();
  const { loading, saving, error, lastCheckupDate, nextCheckupDue, saveDate } = useCheckupReminder();
  const [tempDate, setTempDate] = useState<string>("");

  const displayDate = tempDate || lastCheckupDate;

  return (
    <section className={`bg-white rounded-lg border border-gray-200 shadow-sm p-4 flex flex-col gap-3 ${className}`}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{t("checkupReminder") ?? "Check-up reminder"}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {t("checkupQuestion") ?? "When was your last check-up?"}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-700">
          {t("lastCheckup")}
        </label>
        <input
          type="date"
          value={displayDate || ""}
          onChange={(e) => setTempDate(e.target.value)}
          className="input bg-white w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          disabled={loading || saving}
        />
        <button
          type="button"
          onClick={() => tempDate && saveDate(tempDate)}
          disabled={!tempDate || saving}
          className="w-full rounded-lg bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? t("saving") ?? "Saving..." : t("saveDate") ?? "Save date"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
        <p className="text-[11px] font-bold uppercase tracking-wide text-purple-600 mb-0.5">
          {t("nextCheckup") ?? "Next check-up"}
        </p>
        <p className="text-xs text-gray-700 leading-snug">
          {nextCheckupDue
            ? t("nextCheckupMessage", { date: nextCheckupDue }) ?? `Due on ${nextCheckupDue}`
            : t("noCheckupDate") ?? "Enter your last check-up date to see when you're due."}
        </p>
      </div>
    </section>
  );
}

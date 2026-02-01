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
    <section className={`bg-white rounded-2xl shadow-md p-5 border border-purple-50 h-full flex flex-col gap-4 ${className}`}>
      <div>
        <p className="text-sm font-semibold text-gray-900">{t("checkupReminder") ?? "Check-up reminder"}</p>
        <p className="text-xs text-gray-600 mt-1">
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
          className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
          disabled={loading || saving}
        />
        <button
          type="button"
          onClick={() => tempDate && saveDate(tempDate)}
          disabled={!tempDate || saving}
          className="inline-flex items-center rounded-full border border-purple-500 px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-500 hover:text-white transition-colors disabled:opacity-50"
        >
          {saving ? t("saving") ?? "Saving..." : t("saveDate") ?? "Save date"}
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <div className="mt-auto bg-purple-50 border border-purple-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-purple-700">
          {t("nextCheckup") ?? "Next check-up"}
        </p>
        <p className="text-sm text-gray-800">
          {nextCheckupDue
            ? t("nextCheckupMessage", { date: nextCheckupDue }) ?? `Your next check-up is due on ${nextCheckupDue}`
            : t("noCheckupDate") ?? "Pick your last check-up date to get a reminder."}
        </p>
      </div>
    </section>
  );
}

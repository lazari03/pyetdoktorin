import React from "react";
import { useTranslation } from "react-i18next";

export type AppointmentFilter = "all" | "upcoming" | "past" | "canceled";

type Props = {
  active: AppointmentFilter;
  onChange: (value: AppointmentFilter) => void;
};

export function AppointmentFilters({ active, onChange }: Props) {
  const { t } = useTranslation();
  const options: { key: AppointmentFilter; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "upcoming", label: t("upcoming") },
    { key: "past", label: t("past") },
    { key: "canceled", label: t("canceled") },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const activeState = active === opt.key;
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeState
                ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:text-purple-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

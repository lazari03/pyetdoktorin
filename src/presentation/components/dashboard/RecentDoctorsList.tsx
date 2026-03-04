import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { dashboardDoctorProfilePath } from "@/navigation/paths";

export type RecentDoctor = {
  id: string;
  name: string;
  specialty?: string;
  lastVisit?: string;
};

type Props = {
  doctors: RecentDoctor[];
};

export function RecentDoctorsList({ doctors }: Props) {
  const { t } = useTranslation();
  const visible = doctors.slice(0, 3); // ensure at least two, up to three in layout
  return (
    <div className="grid gap-3">
      {visible.length === 0 && (
        <div className="text-xs text-gray-500">{t("noRecentDoctors") ?? "No recent doctors."}</div>
      )}
      {visible.map((doc) => (
        <Link
          key={doc.id}
          href={dashboardDoctorProfilePath(doc.id)}
          className="group rounded-2xl border border-slate-200/70 bg-white/70 p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-white hover:border-slate-200 transition"
        >
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-50 border border-purple-100/60 text-purple-800 font-bold text-lg flex items-center justify-center">
            {doc.name?.slice(0, 1) || "D"}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-gray-900 truncate group-hover:underline">{doc.name || "Doctor"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {doc.specialty && <span className="truncate">{doc.specialty}</span>}
              {doc.lastVisit && (
                <span className="text-gray-500">
                  • {t("lastVisit") || "Last visit"}: {doc.lastVisit}
                </span>
              )}
            </div>
          </div>
          <span className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors whitespace-nowrap">
            {t("viewDoctor")}
          </span>
        </Link>
      ))}
    </div>
  );
}

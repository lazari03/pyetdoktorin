import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

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
          href={`/dashboard/doctor/${doc.id}`}
          className="rounded-2xl border border-purple-50 bg-white shadow-sm p-4 flex items-center gap-4 hover:border-purple-100 hover:shadow-md transition"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 font-bold text-lg flex items-center justify-center">
            {doc.name?.slice(0, 1) || "D"}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-gray-900 truncate hover:underline">{doc.name || "Doctor"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {doc.specialty && <span className="truncate">{doc.specialty}</span>}
              {doc.lastVisit && <span className="text-gray-500">• Last visit: {doc.lastVisit}</span>}
            </div>
          </div>
          <span className="inline-flex items-center rounded-full border border-purple-500 px-4 py-2 text-xs font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition-colors whitespace-nowrap">
            {t("viewDoctor")}
          </span>
        </Link>
      ))}
    </div>
  );
}

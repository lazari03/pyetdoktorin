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
    <div className="flex flex-col gap-1">
      {visible.length === 0 && (
        <div className="text-[12px] text-gray-500">{t("noRecentDoctors") ?? "No recent doctors."}</div>
      )}
      {visible.map((doc) => (
        <Link
          key={doc.id}
          href={dashboardDoctorProfilePath(doc.id)}
          className="group flex items-center gap-2.5 rounded-lg px-1 py-1.5 hover:bg-gray-50/80 transition-colors"
        >
          <div className="shrink-0 h-8 w-8 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 font-bold text-[11.5px] flex items-center justify-center">
            {doc.name?.slice(0, 1) || "D"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-semibold text-gray-900 truncate group-hover:underline">{doc.name || "Doctor"}</p>
            <p className="text-[10.5px] text-gray-400 truncate">
              {doc.specialty}
              {doc.specialty && doc.lastVisit && " · "}
              {doc.lastVisit}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-purple-700 group-hover:text-purple-800">
            {t("viewDoctor")}
          </span>
        </Link>
      ))}
    </div>
  );
}

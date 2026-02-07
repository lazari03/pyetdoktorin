import React from "react";
import { useTranslation } from "react-i18next";

export type RecentPatient = {
  id: string;
  name: string;
  appointmentType?: string;
  lastVisit?: string;
};

type Props = {
  patients: RecentPatient[];
};

export function RecentPatientsList({ patients }: Props) {
  const { t } = useTranslation();
  const visible = patients.slice(0, 3);
  
  return (
    <div className="grid gap-3">
      {visible.length === 0 && (
        <div className="text-xs text-gray-500">{t("noRecentPatients") ?? "No recent patients."}</div>
      )}
      {visible.map((patient) => (
        <div
          key={patient.id}
          className="rounded-2xl border border-purple-50 bg-white shadow-sm p-4 flex items-center gap-4 hover:border-purple-100 hover:shadow-md transition"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 font-bold text-lg flex items-center justify-center">
            {patient.name?.slice(0, 1) || "P"}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{patient.name || "Patient"}</p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {patient.appointmentType && <span className="truncate">{patient.appointmentType}</span>}
              {patient.lastVisit && <span className="text-gray-500">• {t("lastVisit") || "Last visit"}: {patient.lastVisit}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

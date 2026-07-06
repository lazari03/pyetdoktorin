"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { TableSkeleton } from "@/presentation/components/Skeleton/TableSkeleton";
import { UserRole } from "@/domain/entities/UserRole";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import { listAppointments } from "@/network/appointments";
import { initialsOf } from "@/presentation/utils/initials";

type PatientSummary = {
  id: string;
  name: string;
  appointmentCount: number;
  lastVisit: string;
  lastAppointmentType: string;
};

export default function MyPatientsPage() {
  const { t } = useTranslation();
  const { role } = useAuth();
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listAppointments();
      const map = new Map<string, PatientSummary>();
      for (const a of response.items) {
        if (!a.patientId) continue;
        const existing = map.get(a.patientId);
        if (!existing || (a.preferredDate || "") > existing.lastVisit) {
          map.set(a.patientId, {
            id: a.patientId,
            name: a.patientName || t("patient") || "Patient",
            appointmentCount: (existing?.appointmentCount || 0) + 1,
            lastVisit: a.preferredDate || existing?.lastVisit || "",
            lastAppointmentType: a.appointmentType || existing?.lastAppointmentType || "",
          });
        } else {
          map.set(a.patientId, { ...existing, appointmentCount: existing.appointmentCount + 1 });
        }
      }
      setPatients(Array.from(map.values()).sort((a, b) => b.lastVisit.localeCompare(a.lastVisit)));
    } catch (err) {
      setPatients([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) => p.name.toLowerCase().includes(term));
  }, [patients, search]);

  if (role !== UserRole.Doctor) {
    return <RedirectingModal show />;
  }

  return (
    <RequestStateGate
      loading={loading && patients.length === 0}
      error={error}
      onRetry={load}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      skeleton={<TableSkeleton />}
      analyticsPrefix="dashboard.patients"
    >
      <div className="py-4 sm:py-6 px-3">
        <div className="max-w-5xl mx-auto space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
              {t("secureAccessEyebrow") || "Secure access"}
            </p>
            <h1 className="text-[15px] font-bold text-gray-900">{t("myPatientsTitle") || "My patients"}</h1>
            <p className="text-[12.5px] text-gray-500">
              {t("myPatientsSubtitle") || "Everyone under your care, at a glance."}
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchByName") || "Search by name"}
              className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-3"
            />

            {filtered.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">{t("noResults") || "No results found"}</p>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400">
                      {t("patient") || "Patient"}
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400">
                      {t("type") || "Type"}
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400">
                      {t("lastVisit") || "Last visit"}
                    </th>
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400">
                      {t("totalAppointments") || "Total appointments"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                            {initialsOf(p.name)}
                          </span>
                          <p className="text-[13px] font-semibold text-gray-900 truncate">{p.name}</p>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-[12.5px] text-gray-600">{p.lastAppointmentType || "—"}</td>
                      <td className="px-3 py-2.5 text-[12.5px] text-gray-600">{p.lastVisit || "—"}</td>
                      <td className="px-3 py-2.5 text-[12.5px] text-gray-900 font-semibold">{p.appointmentCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}

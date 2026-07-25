"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useReciepeStore } from "@/store/reciepeStore";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Image from "next/image";
import { DocumentTextIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { UserRole } from "@/domain/entities/UserRole";
import type { ReciepePayload } from "@/application/ports/IReciepeService";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { TableSkeleton } from '@/presentation/components/Skeleton/TableSkeleton';
import { DASHBOARD_PATHS } from "@/navigation/paths";
import Pager from "@/presentation/components/Pager/Pager";

const PAGE_SIZE = 10;

type Reciepe = {
  id: string;
  doctor: string;
  type: "standard" | "reimbursement";
  reimbursementCode?: string;
  pharmacy?: string;
  title: string;
  medicines: string;
  dosage: string;
  notes?: string;
  date: string;
  status?: "pending" | "accepted" | "rejected";
  signatureDataUrl?: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

function StatusBadge({ status, label }: { status: string; label: string }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {label}
    </span>
  );
}

function EmptyState({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 py-10 px-4">
      <DocumentTextIcon className="h-10 w-10 text-gray-300" />
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      <p className="text-xs text-gray-400 max-w-[22rem]">{hint}</p>
    </div>
  );
}

export default function PatientReciepesPage() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // Shared with dashboard/page.tsx's prescription count and useNotificationsLogic,
  // so this list is fetched once per role/uid instead of independently per consumer.
  const rawReciepes = useReciepeStore((s) => s.reciepes);
  const loading = useReciepeStore((s) => s.loading);
  const error = useReciepeStore((s) => s.error);
  const fetchReciepes = useReciepeStore((s) => s.fetchReciepes);

  const load = useCallback(async () => {
    if (!user?.uid || !role) return;
    await fetchReciepes(role, user.uid, true);
  }, [fetchReciepes, role, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !role) return;
    fetchReciepes(role, user.uid);
  }, [fetchReciepes, role, user?.uid]);

  const reciepes: Reciepe[] = useMemo(() => {
    return rawReciepes.map((r: ReciepePayload) => ({
      id: r.id || r.patientId + String(r.createdAt ?? ""),
      doctor: r.doctorName || "",
      type: r.type || "standard",
      reimbursementCode: r.reimbursementCode,
      pharmacy: r.pharmacyName,
      title: r.title || t("reciepeTitleDoctor") || "Reciepe",
      medicines: Array.isArray(r.medicines)
        ? r.medicines.join(", ")
        : String(r.medicines ?? ""),
      dosage: r.dosage || "",
      notes: r.notes,
      date: new Date(r.createdAt ?? Date.now()).toISOString().split("T")[0],
      status: (r.status as Reciepe["status"]) || "pending",
      signatureDataUrl: r.signatureDataUrl,
    }));
  }, [rawReciepes, t]);

  useEffect(() => {
    setActiveId((prev) => prev || reciepes[0]?.id || null);
  }, [reciepes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return reciepes;
    return reciepes.filter((r) =>
      [r.title, r.doctor, r.medicines, r.date]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [reciepes, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (role !== UserRole.Patient) return <RedirectingModal show />;

  const active = filtered.find((r) => r.id === activeId) || paged[0];

  return (
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={error}
      onRetry={load}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      skeleton={<TableSkeleton />}
      analyticsPrefix="dashboard.reciepes"
    >
      <div className="max-w-5xl mx-auto space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-purple-600">
            {t("secureAccessEyebrow") || "Secure access"}
          </p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">
            {t("myReciepesTitle") || "My Prescriptions"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("myReciepesSubtitle") ||
              "Your prescriptions, kept private and ready for your care decisions."}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(260px,1fr)_2fr] items-start">
          {/* List */}
          <aside className="rounded-2xl border border-gray-100 bg-white shadow-sm p-3 space-y-2">
            {reciepes.length > 0 && (
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  type="search"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-900 outline-none transition-colors focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t("searchPrescriptions") || "Search…"}
                />
              </div>
            )}

            {filtered.length === 0 ? (
              <EmptyState
                title={search ? t("noSearchResults") || "No matches" : t("noReciepesYet") || "No prescriptions yet"}
                hint={
                  search
                    ? t("tryOtherSearch") || "Try a different search."
                    : t("noReciepesHint") || "Your doctor-issued prescriptions will appear here."
                }
              />
            ) : (
              <div className="space-y-1">
                {paged.map((r) => {
                  const isActive = active?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setActiveId(r.id)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 transition-colors ${
                        isActive ? "bg-purple-50 border border-purple-200" : "border border-transparent hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">{r.title}</p>
                        {r.status && <StatusBadge status={r.status} label={t(r.status) || r.status} />}
                      </div>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {r.doctor || t("doctor")} · {r.date} ·{" "}
                        {r.type === "reimbursement"
                          ? t("prescriptionTypeReimbursement") || "Reimb."
                          : t("prescriptionTypeStandard") || "Std."}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
            <Pager page={safePage} pageCount={pageCount} onChange={setPage} />
          </aside>

          {/* Detail */}
          <section className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 min-h-[320px]">
            {active ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-base font-bold text-gray-900">{active.title}</p>
                    <div className="flex items-center gap-2 flex-wrap mt-1 text-xs text-gray-500">
                      <span>{active.doctor}</span>
                      <span>•</span>
                      <span>{active.date}</span>
                      {active.status && <StatusBadge status={active.status} label={t(active.status) || active.status} />}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-500">
                      {t("prescriptionTypeLabel") || "Type"}
                    </p>
                    <span
                      className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        active.type === "reimbursement" ? "bg-sky-50 text-sky-700" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {active.type === "reimbursement"
                        ? t("prescriptionTypeReimbursement") || "Reimbursement"
                        : t("prescriptionTypeStandard") || "Standard"}
                    </span>
                  </div>
                  {active.reimbursementCode && (
                    <div className="rounded-xl border border-sky-100 bg-sky-50 p-3">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-sky-600">
                        {t("reimbursementCodeLabel") || "Reimbursement code"}
                      </p>
                      <p className="text-sm text-gray-900 font-mono mt-1">{active.reimbursementCode}</p>
                    </div>
                  )}
                  {active.type === "reimbursement" && active.pharmacy && (
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-500">
                        {t("pharmacyName") || "Pharmacy"}
                      </p>
                      <p className="text-sm text-gray-900 mt-1">{active.pharmacy}</p>
                    </div>
                  )}
                </div>

                {active.type === "standard" && (
                  <div className="space-y-2">
                    {active.medicines && (
                      <div className="rounded-xl border border-purple-100 bg-purple-50/60 p-3">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-purple-600">
                          {t("medicinesLabel") || "Medicines"}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{active.medicines}</p>
                      </div>
                    )}
                    {active.dosage && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-500">
                          {t("dosageLabel") || "Dosage"}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{active.dosage}</p>
                      </div>
                    )}
                    {active.notes && (
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[10.5px] font-semibold uppercase tracking-wide text-gray-500">
                          {t("notesLabel") || "Notes"}
                        </p>
                        <p className="text-sm text-gray-900 mt-1">{active.notes}</p>
                      </div>
                    )}
                  </div>
                )}

                {active.signatureDataUrl && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">
                      {t("doctorSignature") || "Doctor signature"}
                    </p>
                    <div className="inline-block border border-gray-200 rounded-xl overflow-hidden bg-white p-2">
                      <Image
                        src={active.signatureDataUrl}
                        alt={t("doctorSignature") || "Doctor signature"}
                        width={300}
                        height={120}
                        unoptimized
                        className="h-auto w-auto max-w-[280px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title={t("noReciepesYet") || "No prescriptions yet"}
                hint={t("noReciepesHint") || "Your doctor-issued prescriptions will appear here."}
              />
            )}
          </section>
        </div>
      </div>
    </RequestStateGate>
  );
}

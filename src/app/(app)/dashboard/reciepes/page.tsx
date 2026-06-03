"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Image from "next/image";
import { UserRole } from "@/domain/entities/UserRole";
import type { ReciepePayload } from "@/application/ports/IReciepeService";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { DASHBOARD_PATHS } from "@/navigation/paths";

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

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name[0] ?? "?").toUpperCase();
}

export default function PatientReciepesPage() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const { getReciepesByPatientUseCase } = useDI();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const response = await getReciepesByPatientUseCase.execute(user.uid);
      const mapped = (response || []).map((r: ReciepePayload) => ({
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
      setReciepes(mapped);
      setActiveId((prev) => prev || mapped[0]?.id || null);
    } catch (err) {
      setReciepes([]);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [getReciepesByPatientUseCase, t, user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  if (role !== UserRole.Patient) return <RedirectingModal show />;

  const active = reciepes.find((r) => r.id === activeId) || reciepes[0];

  return (
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={error}
      onRetry={load}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      analyticsPrefix="dashboard.reciepes"
    >
      <div className="page">
        <div className="page-inner page-inner-md">

          {/* Page header */}
          <div>
            <p className="page-eyebrow">
              {t("secureAccessEyebrow") || "Secure access"}
            </p>
            <h1 className="page-title">
              {t("myReciepesTitle") || "My Prescriptions"}
            </h1>
            <p className="page-subtitle">
              {t("myReciepesSubtitle") ||
                "Your prescriptions, kept private and ready for your care decisions."}
            </p>
          </div>

          <div className="rx-layout">
            {/* Sidebar list */}
            <aside className="panel space-y-2">
              {reciepes.length === 0 ? (
                <div className="empty-state">
                  <svg
                    className="h-10 w-10 empty-state-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="empty-state-title">
                    {t("noReciepesYet") || "No prescriptions yet"}
                  </p>
                  <p className="empty-state-hint">
                    {t("noReciepesHint") ||
                      "Your doctor-issued prescriptions will appear here."}
                  </p>
                </div>
              ) : (
                reciepes.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveId(r.id)}
                    className={`rx-item ${
                      active?.id === r.id ? "rx-item-active" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="avatar-sm">{initials(r.doctor || "?")}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {r.title}
                          </p>
                          {r.status && (
                            <span className={`badge badge-${r.status}`}>
                              {t(r.status)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {r.doctor || t("doctor")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-400">
                            {r.date}
                          </span>
                          <span
                            className={`badge ${
                              r.type === "reimbursement"
                                ? "badge-reimbursement"
                                : "badge-standard"
                            }`}
                          >
                            {r.type === "reimbursement"
                              ? t("prescriptionTypeReimbursement") || "Reimb."
                              : t("prescriptionTypeStandard") || "Std."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </aside>

            {/* Detail panel */}
            <section className="panel space-y-4" style={{ minHeight: "320px" }}>
              {active ? (
                <>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="detail-title">{active.title}</p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span className="detail-meta">{active.doctor}</span>
                        <span className="detail-meta">•</span>
                        <span className="detail-meta">{active.date}</span>
                        {active.status && (
                          <span className={`badge badge-${active.status}`}>
                            {t(active.status)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="tile tile-muted">
                      <p className="tile-label">
                        {t("prescriptionTypeLabel") || "Type"}
                      </p>
                      <span
                        className={`badge ${
                          active.type === "reimbursement"
                            ? "badge-reimbursement"
                            : "badge-standard"
                        }`}
                      >
                        {active.type === "reimbursement"
                          ? t("prescriptionTypeReimbursement") || "Reimbursement"
                          : t("prescriptionTypeStandard") || "Standard"}
                      </span>
                    </div>
                    {active.reimbursementCode && (
                      <div className="tile tile-sky">
                        <p className="tile-label tile-label-sky">
                          {t("reimbursementCodeLabel") || "Reimbursement code"}
                        </p>
                        <p
                          className="tile-value"
                          style={{ fontFamily: "monospace" }}
                        >
                          {active.reimbursementCode}
                        </p>
                      </div>
                    )}
                    {active.type === "reimbursement" && active.pharmacy && (
                      <div className="tile tile-muted">
                        <p className="tile-label">
                          {t("pharmacyName") || "Pharmacy"}
                        </p>
                        <p className="tile-value">{active.pharmacy}</p>
                      </div>
                    )}
                  </div>

                  {active.type === "standard" && (
                    <div className="space-y-2">
                      {active.medicines && (
                        <div className="tile tile-primary">
                          <p className="tile-label tile-label-primary">
                            {t("medicinesLabel") || "Medicines"}
                          </p>
                          <p className="tile-value">{active.medicines}</p>
                        </div>
                      )}
                      {active.dosage && (
                        <div className="tile tile-muted">
                          <p className="tile-label">
                            {t("dosageLabel") || "Dosage"}
                          </p>
                          <p className="tile-value">{active.dosage}</p>
                        </div>
                      )}
                      {active.notes && (
                        <div className="tile tile-muted">
                          <p className="tile-label">
                            {t("notesLabel") || "Notes"}
                          </p>
                          <p className="tile-value">{active.notes}</p>
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
                </>
              ) : (
                <div className="empty-state" style={{ minHeight: "280px" }}>
                  <svg
                    className="h-12 w-12 empty-state-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="empty-state-title">
                    {t("noReciepesYet") || "No prescriptions yet"}
                  </p>
                  <p className="empty-state-hint">
                    {t("noReciepesHint") ||
                      "Your doctor-issued prescriptions will appear here."}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}

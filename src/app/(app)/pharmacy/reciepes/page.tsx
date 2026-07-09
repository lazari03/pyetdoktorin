"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Image from "next/image";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { ListSkeleton } from '@/presentation/components/Skeleton/ListSkeleton';
import { PHARMACY_PATHS } from "@/navigation/paths";
import { PillIcon, ClipboardIcon, UserIcon } from "@/presentation/components/icons/MiniIcons";
import { initialsOf } from "@/presentation/utils/initials";
import { UserRole } from "@/domain/entities/UserRole";
import { useToast } from "@/presentation/components/Toast/ToastProvider";

type Reciepe = {
  id: string;
  patient: string;
  doctor: string;
  type: "standard" | "reimbursement";
  reimbursementCode?: string;
  pharmacyName?: string;
  title: string;
  medicines: string;
  dosage: string;
  notes?: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
  signatureDataUrl?: string;
};

type StatusFilter = "all" | "pending" | "accepted" | "rejected";

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : (name[0] ?? "?").toUpperCase();
}

export default function PharmacyReciepesPage() {
  const { role, user } = useAuth();
  const { getReciepesByPharmacyUseCase, updateReciepeStatusUseCase } = useDI();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const items = await getReciepesByPharmacyUseCase.execute(user.uid);
      const mapped = (items || []).map((r) => ({
        id: r.id || `${r.pharmacyId ?? ""}${r.createdAt}`,
        patient: r.patientName,
        doctor: r.doctorName || "",
        type: r.type || "standard",
        reimbursementCode: r.reimbursementCode,
        pharmacyName: r.pharmacyName,
        title:
          r.title ||
          (r.type === "reimbursement"
            ? t("prescriptionTypeReimbursement") || "Reimbursement"
            : t("reciepeTitleDoctor") || "Reciepe"),
        medicines: Array.isArray(r.medicines)
          ? r.medicines.join(", ")
          : String(r.medicines ?? ""),
        dosage: r.dosage || "",
        notes: r.notes,
        createdAt: new Date(r.createdAt ?? Date.now())
          .toISOString()
          .split("T")[0],
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
  }, [getReciepesByPharmacyUseCase, t, user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? reciepes
        : reciepes.filter((r) => r.status === statusFilter),
    [reciepes, statusFilter]
  );

  const active = filtered.find((r) => r.id === activeId) || filtered[0];

  if (role !== UserRole.Pharmacy) return <RedirectingModal show />;

  const handleStatus = async (
    id: string,
    status: "accepted" | "rejected"
  ) => {
    try {
      await updateReciepeStatusUseCase.execute(id, status);
      setReciepes((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      trackAnalyticsEvent("prescription_status_updated", {
        prescriptionId: id,
        status,
      });
      toast({
        variant: "success",
        message:
          status === "accepted"
            ? t("prescriptionAccepted") || "Prescription accepted"
            : t("prescriptionRejected") || "Prescription rejected",
      });
    } catch (err) {
      trackAnalyticsEvent("prescription_status_failed", {
        prescriptionId: id,
        status,
        reason:
          err instanceof Error
            ? err.message.slice(0, 120)
            : "unknown_error",
      });
      toast({
        variant: "error",
        message: t("genericError") || "Something went wrong. Please try again.",
      });
    }
  };

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("all") || "All" },
    { value: "pending", label: t("pending") || "Pending" },
    { value: "accepted", label: t("accepted") || "Accepted" },
    { value: "rejected", label: t("rejected") || "Rejected" },
  ];

  return (
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={error}
      onRetry={load}
      homeHref={PHARMACY_PATHS.root}
      loadingLabel={t("loading")}
      analyticsPrefix="pharmacy.reciepes"
    >
      <div className="page">
        <div className="page-inner page-inner-md">

          {/* Page header */}
          <div>
            <p className="page-eyebrow">
              {t("secureAccessEyebrow") || "Secure access"}
            </p>
            <h1 className="page-title">
              {t("pharmacyReciepesTitle") || "Prescriptions"}
            </h1>
            <p className="page-subtitle">
              {t("pharmacyReciepesSubtitle") ||
                "View prescriptions to dispense and update their status."}
            </p>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setStatusFilter(f.value);
                  setActiveId(null);
                }}
                className={`filter-pill ${
                  statusFilter === f.value
                    ? "filter-pill-active"
                    : "filter-pill-inactive"
                }`}
              >
                {f.label}
                {f.value !== "all" && (
                  <span className="ml-1 opacity-70">
                    ({reciepes.filter((r) => r.status === f.value).length})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Inbox layout */}
          <div className="rx-layout">

            {/* Sidebar list */}
            <aside className="panel space-y-2">
              {loading && reciepes.length === 0 ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton" style={{ height: "72px" }} />
                  ))}
                </>
              ) : filtered.length === 0 ? (
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
                    {statusFilter === "all"
                      ? t("noPrescriptionsYet") || "No prescriptions yet"
                      : t("noPrescriptionsStatus") ||
                        `No ${statusFilter} prescriptions`}
                  </p>
                  <p className="empty-state-hint">
                    {statusFilter === "all"
                      ? t("noPrescriptionsHint") ||
                        "Prescriptions assigned to your pharmacy will appear here."
                      : t("tryOtherFilter") || "Try a different filter."}
                  </p>
                </div>
              ) : (
                filtered.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveId(r.id)}
                    className={`rx-item ${
                      active?.id === r.id ? "rx-item-active" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="avatar-sm">{initials(r.patient)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <p
                            className="text-sm font-semibold text-gray-900 truncate"
                            style={{ lineHeight: 1.3 }}
                          >
                            {r.title}
                          </p>
                          <span className={`badge badge-${r.status}`}>
                            {t(r.status)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 truncate">
                          {r.patient}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-gray-400">
                            {r.createdAt}
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
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="detail-title">{active.title}</p>
                      <p className="detail-meta">{active.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge badge-${active.status}`}>
                        {t(active.status)}
                      </span>
                      {active.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(active.id, "accepted")}
                            className="btn-accept"
                          >
                            {t("markCompleted") || "Accept"}
                          </button>
                          <button
                            onClick={() => handleStatus(active.id, "rejected")}
                            className="btn-reject"
                          >
                            {t("reject") || "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Info tiles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="tile tile-primary">
                      <p className="tile-label tile-label-primary">
                        {t("patientName") || "Patient"}
                      </p>
                      <p className="tile-value">{active.patient}</p>
                    </div>
                    <div className="tile tile-muted">
                      <p className="tile-label">
                        {t("doctorName") || "Doctor"}
                      </p>
                      <p className="tile-value">{active.doctor || "—"}</p>
                    </div>
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
                    {active.pharmacyName && (
                      <div className="tile tile-muted">
                        <p className="tile-label">
                          {t("pharmacyName") || "Pharmacy"}
                        </p>
                        <p className="tile-value">{active.pharmacyName}</p>
                      </div>
                    )}
                  </div>

                  {/* Standard prescription fields */}
                  {active.type === "standard" && (
                    <div className="space-y-2">
                      {active.medicines && (
                        <div className="tile tile-muted">
                          <p className="tile-label">
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

                  {/* Signature */}
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
                    {t("selectPrescription") || "Select a prescription"}
                  </p>
                  <p className="empty-state-hint">
                    {t("selectPrescriptionHint") ||
                      "Choose a prescription from the list to view its details."}
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

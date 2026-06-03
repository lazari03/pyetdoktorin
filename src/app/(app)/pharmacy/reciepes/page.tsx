"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Image from "next/image";
import { fetchPrescriptions, updatePrescriptionStatus } from '@/network/prescriptions';
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { PHARMACY_PATHS } from "@/navigation/paths";
import { UserRole } from "@/domain/entities/UserRole";

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

export default function PharmacyReciepesPage() {
  const { role, user } = useAuth();
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchPrescriptions();
      const mapped = (response.items || []).map((r) => ({
        id: r.id || `${r.pharmacyId ?? ''}${r.createdAt}`,
        patient: r.patientName,
        doctor: r.doctorName || "",
        type: r.type || "standard",
        reimbursementCode: r.reimbursementCode,
        pharmacyName: r.pharmacyName,
        title: r.title || (r.type === "reimbursement"
          ? (t("prescriptionTypeReimbursement") || "Reimbursement")
          : (t("reciepeTitleDoctor") || "Reciepe")),
        medicines: Array.isArray(r.medicines) ? r.medicines.join(', ') : String(r.medicines ?? ''),
        dosage: r.dosage || "",
        notes: r.notes,
        createdAt: new Date(r.createdAt).toISOString().split("T")[0],
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
  }, [t, user?.uid]);

  useEffect(() => {
    load();
  }, [load]);

  if (role !== UserRole.Pharmacy) return <RedirectingModal show />;

  const active = reciepes.find((r) => r.id === activeId) || reciepes[0];

  const handleStatus = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updatePrescriptionStatus(id, status);
      setReciepes((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      trackAnalyticsEvent('prescription_status_updated', { prescriptionId: id, status });
    } catch (err) {
      trackAnalyticsEvent('prescription_status_failed', {
        prescriptionId: id,
        status,
        reason: err instanceof Error ? err.message.slice(0, 120) : 'unknown_error',
      });
    }
  };

  return (
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={error}
      onRetry={load}
      homeHref={PHARMACY_PATHS.root}
      loadingLabel={t('loading')}
      analyticsPrefix="pharmacy.reciepes"
    >
      <div className="min-h-screen py-6 px-3">
        <div className="max-w-5xl mx-auto space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">{t("secureAccessEyebrow") || "Secure access"}</p>
            <h1 className="text-2xl font-bold text-gray-900">{t("pharmacyReciepesTitle") || "Reciepes"}</h1>
            <p className="text-sm text-gray-600">{t("pharmacyReciepesSubtitle") || "View prescriptions to dispense and update their status."}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <aside className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4 space-y-2 h-full">
              {reciepes.length === 0 && (
                <p className="text-sm text-gray-500 py-4">{t("noReciepes") || "No reciepes found."}</p>
              )}
              {reciepes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setActiveId(r.id)}
                  className={`w-full text-left rounded-2xl border px-3 py-2 transition ${
                    active?.id === r.id ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-gray-900 truncate flex-1">{r.title}</p>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      r.type === "reimbursement" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {r.type === "reimbursement"
                        ? (t("prescriptionTypeReimbursement") || "Reimbursement")
                        : (t("prescriptionTypeStandard") || "Standard")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{r.patient}</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className="text-[11px] text-gray-500">{r.createdAt}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      r.status === "accepted"
                        ? "bg-green-50 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {t(r.status)}
                    </span>
                  </div>
                </button>
              ))}
            </aside>

            <section className="lg:col-span-2 bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-4">
              {active ? (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{active.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{active.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        active.status === "accepted"
                          ? "bg-green-50 text-green-700"
                          : active.status === "rejected"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                      }`}>
                        {t(active.status)}
                      </span>
                      {active.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleStatus(active.id, "accepted")}
                            className="inline-flex items-center rounded-full border border-green-500 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white transition"
                          >
                            {t("markCompleted") || "Accept"}
                          </button>
                          <button
                            onClick={() => handleStatus(active.id, "rejected")}
                            className="inline-flex items-center rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white transition"
                          >
                            {t("reject") || "Reject"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("patientName") || "Patient"}</p>
                      <p className="text-gray-900">{active.patient}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("doctorName") || "Doctor"}</p>
                      <p className="text-gray-900">{active.doctor || "-"}</p>
                    </div>
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("prescriptionTypeLabel") || "Type"}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        active.type === "reimbursement" ? "bg-sky-50 text-sky-700" : "bg-slate-100 text-slate-700"
                      }`}>
                        {active.type === "reimbursement"
                          ? (t("prescriptionTypeReimbursement") || "Reimbursement")
                          : (t("prescriptionTypeStandard") || "Standard")}
                      </span>
                    </div>
                    {active.reimbursementCode && (
                      <div className="rounded-2xl bg-sky-50 border border-sky-100 px-3 py-2">
                        <p className="text-[11px] font-semibold text-sky-600 uppercase tracking-wide mb-0.5">{t("reimbursementCodeLabel") || "Reimbursement code"}</p>
                        <p className="text-gray-900 font-mono">{active.reimbursementCode}</p>
                      </div>
                    )}
                    {active.pharmacyName && (
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("pharmacyName") || "Pharmacy"}</p>
                        <p className="text-gray-900">{active.pharmacyName}</p>
                      </div>
                    )}
                  </div>

                  {active.type === "standard" && (
                    <div className="space-y-2 text-sm">
                      {active.medicines && (
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("medicinesLabel") || "Medicines"}</p>
                          <p className="text-gray-900">{active.medicines}</p>
                        </div>
                      )}
                      {active.dosage && (
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("dosageLabel") || "Dosage"}</p>
                          <p className="text-gray-900">{active.dosage}</p>
                        </div>
                      )}
                      {active.notes && (
                        <div className="rounded-2xl bg-gray-50 border border-gray-100 px-3 py-2">
                          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{t("notesLabel") || "Notes"}</p>
                          <p className="text-gray-900">{active.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {active.signatureDataUrl && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">{t("doctorSignature") || "Doctor signature"}</p>
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
                <p className="text-sm text-gray-500">{t("noReciepes") || "No reciepes found."}</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}

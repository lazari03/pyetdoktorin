"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import Link from "next/link";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import { UserRole } from "@/domain/entities/UserRole";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import type { ReciepePayload } from "@/application/ports/IReciepeService";

type PharmacyNotification = {
  id: string;
  title: string;
  detail: string;
  status: "info" | "action";
  date: string;
};

type PharmacyReciepe = {
  id: string;
  patient: string;
  doctor: string;
  title: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
  medicines: string;
  dosage: string;
  signatureDataUrl?: string;
};

export default function PharmacyDashboardPage() {
  const { role, user } = useAuth();
  const { t } = useTranslation();
  const { getReciepesByPharmacyUseCase, updateReciepeStatusUseCase } = useDI();
  const [reciepes, setReciepes] = useState<PharmacyReciepe[]>([]);

  const notifications: PharmacyNotification[] = useMemo(() => {
    return reciepes.slice(0, 5).map((r) => ({
      id: r.id,
      title: `${t("reciepeTitleDoctor") || "Reciepe"} • ${r.title}`,
      detail: `${r.patient} • ${r.createdAt}`,
      status: r.status === "pending" ? "action" : "info",
      date: r.createdAt,
    }));
  }, [reciepes, t]);

  useEffect(() => {
    if (role === UserRole.Pharmacy) return;
  }, [role]);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        const response = await getReciepesByPharmacyUseCase.execute(user.uid);
        const mapped = (response || [])
          .map((r: ReciepePayload) => ({
            id: r.id || `${r.pharmacyId ?? ''}${r.createdAt ?? ''}`,
            patient: r.patientName,
            doctor: r.doctorName || "",
            title: r.title || t("reciepeTitleDoctor") || "Reciepe",
            medicines: Array.isArray(r.medicines) ? r.medicines.join(', ') : String(r.medicines ?? ''),
            dosage: r.dosage || "",
            createdAt: new Date(r.createdAt ?? Date.now()).toISOString().split("T")[0],
            status: (r.status as PharmacyReciepe["status"]) || "pending",
            signatureDataUrl: r.signatureDataUrl,
          }));
        setReciepes(mapped);
      } catch {
        setReciepes([]);
      }
    };
    load();
  }, [user?.uid, t, getReciepesByPharmacyUseCase]);

  if (role !== UserRole.Pharmacy) return <RedirectingModal show />;

  const pendingCount = reciepes.filter((r) => r.status === "pending").length;
  const processedCount = reciepes.filter((r) => r.status !== "pending").length;

  const markReciepe = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateReciepeStatusUseCase.execute(id, status);
      setReciepes((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      trackAnalyticsEvent('prescription_status_updated', { prescriptionId: id, status });
    } catch (error) {
      trackAnalyticsEvent('prescription_status_failed', {
        prescriptionId: id,
        status,
        reason: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
      });
    }
  };

  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">{t("secureAccessEyebrow") || "Secure access"}</p>
          <h1 className="text-2xl font-bold text-gray-900">{t("pharmacyDashboardTitle") || "Pharmacy dashboard"}</h1>
          <p className="text-sm text-gray-600">{t("pharmacyDashboardSubtitle") || "Monitor orders, prescriptions, and fulfilment safely."}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label={t("pendingReciepes") || "Pending prescriptions"}
            value={pendingCount.toString()}
            helper={t("awaitingFulfillment") || "Awaiting fulfillment"}
          />
          <StatCard
            label={t("notificationsLabel") || "Notifications"}
            value={notifications.length.toString()}
            helper={t("today") || "Today"}
          />
          <StatCard
            label={t("processedReciepes") || "Processed reciepes"}
            value={processedCount.toString()}
            helper={t("processedReciepesHelper") || "Completed or rejected prescriptions"}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <section className="lg:col-span-2 bg-white rounded-3xl border border-purple-50 shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900">{t("reciepeInbox") || "Prescription inbox"}</p>
                <p className="text-xs text-gray-600">{t("reciepeInboxSubtitle") || "Latest prescriptions to dispense"}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {reciepes.map((r) => (
                <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                    <p className="text-xs text-gray-600 truncate">{r.patient} • {r.doctor}</p>
                    <p className="text-[11px] text-gray-500">{r.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "accepted"
                        ? "bg-green-50 text-green-700"
                        : r.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {t(r.status)}
                    </span>
                    {r.status === "pending" && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => markReciepe(r.id, "accepted")}
                          className="inline-flex items-center rounded-full border border-green-500 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white"
                        >
                          {t("markCompleted") || "Accept"}
                        </button>
                        <button
                          onClick={() => markReciepe(r.id, "rejected")}
                          className="inline-flex items-center rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white"
                        >
                          {t("reject") || "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

	          <section className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4 space-y-3 h-full">
	            <div className="flex items-center justify-between">
	              <div>
	                <p className="text-sm font-semibold text-gray-900">{t("notificationsLabel") || "Notifications"}</p>
	                <p className="text-xs text-gray-600">{t("pharmacyNotificationsSubtitle") || "Orders and prescription updates"}</p>
	              </div>
	              <Link href={DASHBOARD_PATHS.notifications} className="text-xs text-purple-600 hover:underline">
	                {t("viewAll") || "View all"}
	              </Link>
	            </div>
	            <ul className="space-y-2 max-h-80 overflow-auto">
              {notifications.map((n) => (
                <li key={n.id} className="p-3 rounded-2xl border border-gray-100 bg-gray-50">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                      <p className="text-xs text-gray-600 truncate">{n.detail}</p>
                      <p className="text-[11px] text-gray-500">{n.date}</p>
                    </div>
                    <span className={`h-2 w-2 mt-1 rounded-full ${n.status === "action" ? "bg-amber-500" : "bg-purple-400"}`} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4">
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-[11px] text-gray-500">{helper}</p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useReciepeStore } from "@/store/reciepeStore";
import Link from "next/link";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import { UserRole } from "@/domain/entities/UserRole";
import { DocumentTextIcon, BellIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { trackAnalyticsEvent } from "@/presentation/utils/trackAnalyticsEvent";
import { getRoleNotificationsPath } from "@/navigation/roleRoutes";
import type { ReciepePayload } from "@/application/ports/IReciepeService";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';import { PHARMACY_PATHS } from "@/navigation/paths";
import { DashboardTutorialGate } from "@/presentation/components/dashboard/DashboardTutorialGate";

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
  const { updateReciepeStatusUseCase } = useDI();
  const notificationsHref = getRoleNotificationsPath(role) || PHARMACY_PATHS.notifications;

  // Shared with pharmacy/reciepes/page.tsx and useNotificationsLogic, so this
  // list is fetched once per pharmacy instead of independently per consumer.
  const rawReciepes = useReciepeStore((s) => s.reciepes);
  const loading = useReciepeStore((s) => s.loading);
  const error = useReciepeStore((s) => s.error);
  const fetchReciepes = useReciepeStore((s) => s.fetchReciepes);
  const setRawReciepes = useReciepeStore((s) => s.setReciepes);

  const load = useCallback(async () => {
    if (!user?.uid || !role) return;
    await fetchReciepes(role, user.uid, true);
  }, [fetchReciepes, role, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !role) return;
    fetchReciepes(role, user.uid);
  }, [fetchReciepes, role, user?.uid]);

  const reciepes: PharmacyReciepe[] = useMemo(() => {
    return rawReciepes.map((r: ReciepePayload) => ({
      id: r.id || `${r.pharmacyId ?? ""}${r.createdAt ?? ""}`,
      patient: r.patientName,
      doctor: r.doctorName || "",
      title: r.title || t("reciepeTitleDoctor") || "Reciepe",
      medicines: Array.isArray(r.medicines) ? r.medicines.join(", ") : String(r.medicines ?? ""),
      dosage: r.dosage || "",
      createdAt: new Date(r.createdAt ?? Date.now()).toISOString().split("T")[0],
      status: (r.status as PharmacyReciepe["status"]) || "pending",
      signatureDataUrl: r.signatureDataUrl,
    }));
  }, [rawReciepes, t]);

  const notifications: PharmacyNotification[] = useMemo(() => {
    return reciepes.slice(0, 5).map((r) => ({
      id: r.id,
      title: `${t("reciepeTitleDoctor") || "Reciepe"} • ${r.title}`,
      detail: `${r.patient} • ${r.createdAt}`,
      status: r.status === "pending" ? "action" : "info",
      date: r.createdAt,
    }));
  }, [reciepes, t]);

  if (role !== UserRole.Pharmacy) return <RedirectingModal show />;

  const pendingCount = reciepes.filter((r) => r.status === "pending").length;
  const processedCount = reciepes.filter((r) => r.status !== "pending").length;

  const markReciepe = async (id: string, status: "accepted" | "rejected") => {
    try {
      await updateReciepeStatusUseCase.execute(id, status);
      setRawReciepes(rawReciepes.map((r) => (r.id === id ? { ...r, status } : r)));
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
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={error}
      onRetry={load}
      homeHref={PHARMACY_PATHS.root}
      loadingLabel={t("loading")}
      skeleton={<StatsPageSkeleton cardCount={3} />}
      analyticsPrefix="pharmacy.dashboard"
    >
      {user?.uid ? <DashboardTutorialGate userId={user.uid} role={role} /> : null}
      <div className="py-4 sm:py-6 px-3">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex flex-col gap-1">
            <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">
              {t("secureAccessEyebrow") || "Secure access"}
            </p>
            <h1 className="text-2xl font-bold text-gray-900">{t("pharmacyDashboardTitle") || "Pharmacy dashboard"}</h1>
            <p className="text-sm text-gray-600">
              {t("pharmacyDashboardSubtitle") || "Monitor orders, prescriptions, and fulfilment safely."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: t("pendingReciepes") || "Pending prescriptions", value: pendingCount, helper: t("awaitingFulfillment") || "Awaiting fulfillment", Icon: DocumentTextIcon, iconBg: "bg-amber-100 text-amber-600", accent: "text-amber-700", delta: pendingCount > 0 ? `${pendingCount} to review` : null, pos: false },
              { label: t("notificationsLabel") || "Notifications", value: notifications.length, helper: t("today") || "Today", Icon: BellIcon, iconBg: "bg-purple-100 text-purple-600", accent: "text-purple-700", delta: null, pos: true },
              { label: t("processedReciepes") || "Processed", value: processedCount, helper: t("processedReciepesHelper") || "Completed or rejected", Icon: CheckCircleIcon, iconBg: "bg-emerald-100 text-emerald-600", accent: "text-emerald-700", delta: processedCount > 0 ? `${processedCount} done` : null, pos: true },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-lg border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
                  <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                    <card.Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="flex items-end gap-2">
                  <p className={`text-3xl font-bold leading-none ${card.accent}`}>{card.value}</p>
                  {card.delta && (
                    <span className={`self-end mb-0.5 text-[10.5px] font-semibold px-1.5 py-0.5 rounded-full ${card.pos ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {card.delta}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 leading-none">{card.helper}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            <section className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">{t("reciepeInbox") || "Prescription inbox"}</p>
                  <p className="text-[11px] text-gray-500">{t("reciepeInboxSubtitle") || "Latest prescriptions to dispense"}</p>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {reciepes.length === 0 ? (
                  <div className="py-10 text-center text-sm text-gray-500">{t("noReciepes") || "No reciepes found."}</div>
                ) : (
                  reciepes.map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                        <p className="text-xs text-gray-600 truncate">
                          {r.patient} • {r.doctor}
                        </p>
                        <p className="text-[11px] text-gray-500">{r.createdAt}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            r.status === "accepted"
                              ? "bg-green-50 text-green-700"
                              : r.status === "rejected"
                                ? "bg-red-50 text-red-700"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {t(r.status)}
                        </span>
                        {r.status === "pending" ? (
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
                        ) : null}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13.5px] font-bold text-gray-900">{t("notificationsLabel") || "Notifications"}</p>
                  <p className="text-[11px] text-gray-500">{t("pharmacyNotificationsSubtitle") || "Orders and prescription updates"}</p>
                </div>
                <Link
                  href={notificationsHref}
                  className="text-[11.5px] font-semibold text-purple-700 hover:text-purple-800"
                  data-analytics="pharmacy.notifications.view_all"
                >
                  {t("viewAll") || "View all"}
                </Link>
              </div>
              <ul className="space-y-2 max-h-80 overflow-auto">
                {notifications.length === 0 ? (
                  <li className="py-10 text-center text-sm text-gray-500">{t("noNotifications") || "No notifications yet"}</li>
                ) : (
                  notifications.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={`${notificationsHref}?focus=${encodeURIComponent(n.id)}`}
                        className="block p-3 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition"
                        data-analytics="pharmacy.notifications.open"
                        data-analytics-id={n.id}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{n.title}</p>
                            <p className="text-xs text-gray-600 truncate">{n.detail}</p>
                            <p className="text-[11px] text-gray-500">{n.date}</p>
                          </div>
                          <span
                            className={`h-2 w-2 mt-1 rounded-full ${n.status === "action" ? "bg-amber-500" : "bg-purple-400"}`}
                          />
                        </div>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}


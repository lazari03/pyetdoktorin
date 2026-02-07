"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import { fetchPrescriptions, updatePrescriptionStatus } from '@/network/prescriptions';

type Reciepe = {
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

export default function PharmacyReciepesPage() {
  const { role } = useAuth();
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<string | null>(null);
  const { user } = useAuth();
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      try {
        const response = await fetchPrescriptions();
        const mapped = (response.items || [])
          .filter((r) => (!r.pharmacyId || !user.uid) ? true : r.pharmacyId === user.uid)
          .map((r) => ({
            id: r.id || `${r.pharmacyId ?? ''}${r.createdAt}`,
            patient: r.patientName,
            doctor: r.doctorName || "",
            title: r.title || t("reciepeTitleDoctor") || "Reciepe",
            medicines: Array.isArray(r.medicines) ? r.medicines.join(', ') : String(r.medicines ?? ''),
            dosage: r.dosage || "",
            createdAt: new Date(r.createdAt).toISOString().split("T")[0],
            status: (r.status as Reciepe["status"]) || "pending",
            signatureDataUrl: r.signatureDataUrl,
          }));
        setReciepes(mapped);
        setActiveId((prev) => prev || mapped[0]?.id || null);
      } catch {
        setReciepes([]);
      }
    };
    load();
  }, [user?.uid, t]);

  if (role !== "pharmacy") return <RedirectingModal show />;

  const active = reciepes.find((r) => r.id === activeId) || reciepes[0];
  const handleStatus = async (id: string, status: "accepted" | "rejected") => {
    await updatePrescriptionStatus(id, status);
    setReciepes((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-purple-600 font-semibold">{t("secureAccessEyebrow") || "Secure access"}</p>
          <h1 className="text-2xl font-bold text-gray-900">{t("pharmacyReciepesTitle") || "Reciepes"}</h1>
          <p className="text-sm text-gray-600">{t("pharmacyReciepesSubtitle") || "View prescriptions to dispense and update their status."}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <aside className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4 space-y-2 h-full">
            {reciepes.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`w-full text-left rounded-2xl border px-3 py-2 transition ${
                  active?.id === r.id ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                <p className="text-xs text-gray-600 truncate">{r.patient}</p>
                <p className="text-[11px] text-gray-500">{r.createdAt}</p>
              </button>
            ))}
          </aside>

          <section className="lg:col-span-2 bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3">
            {active ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{active.title}</p>
                    <p className="text-xs text-gray-600">{active.patient} • {active.doctor}</p>
                    <p className="text-[11px] text-gray-500">{active.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatus(active.id, "accepted")}
                          className="inline-flex items-center rounded-full border border-green-500 px-3 py-1 text-xs font-semibold text-green-700 hover:bg-green-500 hover:text-white"
                        >
                          {t("markCompleted") || "Accept"}
                        </button>
                        <button
                          onClick={() => handleStatus(active.id, "rejected")}
                          className="inline-flex items-center rounded-full border border-red-500 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-500 hover:text-white"
                        >
                          {t("reject") || "Reject"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1 text-sm text-gray-800">
                  <div>
                    <span className="font-semibold">{t("medicinesLabel") || "Medicines"}: </span>
                    <span>{active.medicines}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{t("dosageLabel") || "Dosage"}: </span>
                    <span>{active.dosage}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">{t("noReciepes") || "No reciepes found."}</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

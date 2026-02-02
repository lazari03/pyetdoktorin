"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import { useDI } from "@/context/DIContext";
import Image from "next/image";

type Reciepe = {
  id: string;
  doctor: string;
  title: string;
  medicines: string;
  dosage: string;
  notes?: string;
  date: string;
  status?: "pending" | "accepted" | "rejected";
  signatureDataUrl?: string;
};

export default function PatientReciepesPage() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const { getReciepesByPatientUseCase } = useDI();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return;
      const data = await getReciepesByPatientUseCase.execute(user.uid);
      setReciepes(
        (data || []).map((r) => ({
          id: r.id || (r.patientId + r.createdAt),
          doctor: r.doctorName || "",
          title: r.title,
          medicines: r.medicines,
          dosage: r.dosage,
          notes: r.notes,
          date: r.createdAt.split("T")[0],
          status: (r.status as Reciepe["status"]) || "pending",
          signatureDataUrl: r.signatureDataUrl,
        }))
      );
      setActiveId((prev) => prev || (data?.[0] ? data[0].patientId + data[0].createdAt : null));
    };
    load();
  }, [getReciepesByPatientUseCase, user?.uid]);

  if (role !== "patient") {
    return <RedirectingModal show />;
  }

  const active = reciepes.find((r) => r.id === activeId) || reciepes[0];

  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">{t("secureAccessEyebrow") || "Secure access"}</p>
          <h1 className="text-2xl font-bold text-gray-900">{t("myReciepesTitle") || "My reciepes"}</h1>
          <p className="text-sm text-gray-600">{t("myReciepesSubtitle") || "Your prescriptions, kept private and ready for your care decisions."}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <aside className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4 space-y-2 h-full">
            {reciepes.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                className={`w-full text-left rounded-2xl border px-3 py-2 ${
                  active?.id === r.id ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-200"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                <p className="text-xs text-gray-600 truncate">{r.doctor}</p>
                <p className="text-[11px] text-gray-500">{r.date}</p>
              </button>
            ))}
          </aside>

          <section className="lg:col-span-2 bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3">
            {active ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{active.title}</p>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>{active.doctor}</span>
                  <span>•</span>
                  <span>{active.date}</span>
                  {active.status && (
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                      active.status === "accepted"
                        ? "bg-green-50 text-green-700"
                        : active.status === "rejected"
                        ? "bg-red-50 text-red-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {t(active.status)}
                    </span>
                  )}
                </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-800">
                  <div>
                    <span className="font-semibold">{t("medicinesLabel") || "Medicines"}: </span>
                    <span>{active.medicines}</span>
                  </div>
                  <div>
                    <span className="font-semibold">{t("dosageLabel") || "Dosage"}: </span>
                    <span>{active.dosage}</span>
                  </div>
                  {active.notes && (
                    <div className="text-gray-700">
                      <span className="font-semibold">{t("notesLabel")}: </span>
                      <span>{active.notes}</span>
                    </div>
                  )}
                </div>
                {active.signatureDataUrl && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-gray-700">Signature</p>
                    <div className="mt-1 max-w-xs border border-gray-200 rounded overflow-hidden">
                      <Image
                        src={active.signatureDataUrl}
                        alt="Signature"
                        width={300}
                        height={120}
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
  );
}

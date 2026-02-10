"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import { SignaturePad } from "@/presentation/components/SignaturePad";
import { fetchAdminUsers } from '@/network/adminUsers';
import { createPrescription, fetchPrescriptions } from '@/network/prescriptions';
import type { Prescription } from '@/network/prescriptions';
import { UserRole } from '@/domain/entities/UserRole';

type Reciepe = {
  id: string;
  patientId: string;
  patient: string;
  pharmacyId?: string;
  pharmacy?: string;
  title: string;
  medicines: string;
  dosage: string;
  notes?: string;
  date: string;
  status?: "pending" | "accepted" | "rejected";
  signatureDataUrl?: string;
};

export default function DoctorReciepePage() {
  const { t } = useTranslation();
  const { role, user } = useAuth();
  const [reciepes, setReciepes] = useState<Reciepe[]>([]);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [pharmacies, setPharmacies] = useState<{ id: string; name: string }[]>([]);
  const [form, setForm] = useState<Omit<Reciepe, "id" | "date">>({
    patientId: "",
    patient: "",
    pharmacyId: "",
    pharmacy: "",
    title: "",
    medicines: "",
    dosage: "",
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toReciepe = useCallback((p: Prescription): Reciepe => ({
    id: p.id,
    patientId: p.patientId,
    patient: p.patientName,
    pharmacyId: p.pharmacyId,
    pharmacy: p.pharmacyName,
    title: p.title || t("reciepeTitleDoctor") || "Reciepe",
    medicines: Array.isArray(p.medicines) ? p.medicines.join(', ') : String(p.medicines ?? ''),
    dosage: p.dosage || "",
    notes: p.notes,
    date: new Date(p.createdAt).toISOString().split("T")[0],
    status: p.status,
    signatureDataUrl: p.signatureDataUrl,
  }), [t]);

  useEffect(() => {
    const loadPatients = async () => {
      try {
        const response = await fetchAdminUsers({ role: UserRole.Patient, pageSize: 500 });
        const pts = (response.items || []).map((u: Record<string, unknown>) => ({
          id: String(u.id ?? u.uid ?? ''),
          name: `${(u.name as string | undefined) ?? ''} ${(u.surname as string | undefined) ?? ''}`.trim() || (u.email as string | undefined) || 'Unknown',
        }));
        setPatients(pts);
      } catch {
        setPatients([]);
      }
    };
    loadPatients();
  }, []);

  useEffect(() => {
    const loadPharmacies = async () => {
      try {
        const response = await fetchAdminUsers({ role: UserRole.Pharmacy, pageSize: 200 });
        const mapped = (response.items || []).map((entry: Record<string, unknown>) => ({
          id: String(entry.id ?? ''),
          name: (entry.pharmacyName as string | undefined) || `${(entry.name as string | undefined) ?? ''} ${(entry.surname as string | undefined) ?? ''}`.trim() || 'Pharmacy',
        }));
        setPharmacies(mapped);
      } catch {
        setPharmacies([]);
      }
    };
    loadPharmacies();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term.length < 4) return [];
    return patients.filter((p) => p.name.toLowerCase().includes(term));
  }, [patients, search]);

  const filteredPharmacies = useMemo(() => {
    const term = pharmacySearch.trim().toLowerCase();
    if (term.length < 2) return [];
    return pharmacies
      .filter((p) => p.name.toLowerCase().includes(term))
      .slice(0, 10);
  }, [pharmacies, pharmacySearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.patientId || !form.pharmacyId || !user?.uid) {
      setSubmitError(t("missingRequiredFields") || "Please select a patient and pharmacy.");
      return;
    }
    if (!form.patient || !form.pharmacy) {
      setSubmitError(t("missingRequiredFields") || "Please select a patient and pharmacy.");
      return;
    }
    const medicineList = form.medicines
      .split(/[\n,]+/)
      .map((m) => m.trim())
      .filter(Boolean);
    if (medicineList.length === 0) {
      setSubmitError(t("missingMedicines") || "Please add at least one medicine.");
      return;
    }
    try {
      setIsSubmitting(true);
      const created = await createPrescription({
        patientId: form.patientId,
        patientName: form.patient,
        pharmacyId: form.pharmacyId,
        pharmacyName: form.pharmacy || '',
        doctorName: user?.name || '',
        medicines: medicineList,
        dosage: form.dosage,
        notes: form.notes,
        title: form.title,
        signatureDataUrl: signatureUrl,
      });
      setReciepes((prev) => [toReciepe(created), ...prev]);
      setForm({ patientId: '', patient: '', pharmacyId: '', pharmacy: '', title: '', medicines: '', dosage: '', notes: '' });
      setSearch('');
      setPharmacySearch('');
      setSignatureUrl('');
    } catch (error) {
      const message = error instanceof Error ? error.message : (t("unknownError") || "Failed to issue prescription.");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPdf = (r: Reciepe) => {
    const serial = r.id;
    const content = `
      <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 700px; margin: 0 auto; color: #1f2937;">
        <h2 style="margin: 0 0 12px; color: #4c1d95;">Reciepe • ${serial}</h2>
        <p style="margin: 4px 0; font-size: 13px;">Issued by pyetdoktorin.al</p>
        <p style="margin: 4px 0; font-size: 13px;">Status: ${r.status ?? "pending"}</p>
        <p style="margin: 4px 0; font-size: 13px;">Date: ${r.date}</p>
        <hr style="margin: 16px 0;" />
        <p style="margin: 4px 0; font-size: 14px;"><strong>Patient:</strong> ${r.patient}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Pharmacy:</strong> ${r.pharmacy ?? "-"}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Title:</strong> ${r.title}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Medicines:</strong> ${r.medicines}</p>
        <p style="margin: 4px 0; font-size: 14px;"><strong>Dosage:</strong> ${r.dosage}</p>
        ${r.notes ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Notes:</strong> ${r.notes}</p>` : ""}
        ${
          r.signatureDataUrl
            ? `<div style="margin-top:16px;"><p style="margin:0 0 6px; font-size: 14px;">Doctor signature</p><img src="${r.signatureDataUrl}" style="max-width:300px;border:1px solid #e5e7eb;"/></div>`
            : ""
        }
        <p style="margin-top:24px; font-size:12px; color:#6b7280;">pyetdoktorin.al • Secure prescription</p>
      </div>
    `;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    w.document.write(content);
    w.document.close();
    w.focus();
    w.print();
  };

  useEffect(() => {
    const loadReciepes = async () => {
      if (!user?.uid) return;
      try {
        const response = await fetchPrescriptions();
        const mapped = (response.items || []).map(toReciepe);
        setReciepes(mapped);
      } catch {
        setReciepes([]);
      }
    };
    loadReciepes();
  }, [user?.uid, toReciepe]);

  if (role !== UserRole.Doctor) {
    return <RedirectingModal show />;
  }

  return (
    <div className="min-h-screen py-6 px-3">
      <div className="max-w-5xl mx-auto space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">{t("secureAccessEyebrow") || "Secure access"}</p>
          <h1 className="text-2xl font-bold text-gray-900">{t("reciepeTitleDoctor") || "Reciepe"}</h1>
          <p className="text-sm text-gray-600">{t("reciepeSubtitleDoctor") || "Issue prescriptions and keep a clear record for your patients."}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{t("reciepeList") || "Issued reciepes"}</h2>
            <div className="space-y-3">
              {reciepes.map((r) => (
                <div key={r.id} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-gray-900 truncate">{r.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-500">{r.date}</span>
                      {r.status && (
                        <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                          r.status === "accepted"
                            ? "bg-green-50 text-green-700"
                            : r.status === "rejected"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {t(r.status)}
                        </span>
                      )}
                      <button
                        onClick={() => downloadPdf(r)}
                        className="text-[11px] text-purple-600 hover:underline"
                      >
                        {t("download") || "Download"}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{t("patient")}: {r.patient}</p>
                  <p className="text-xs text-gray-700">{t("medicinesLabel") || "Medicines"}: {r.medicines}</p>
                  <p className="text-xs text-gray-700">{t("dosageLabel") || "Dosage"}: {r.dosage}</p>
                  {r.notes && <p className="text-xs text-gray-600 mt-1">{r.notes}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">{t("newReciepe") || "New reciepe"}</h2>
            <form className="space-y-3" onSubmit={handleSubmit}>
              {submitError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {submitError}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("patientName")}</label>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchByName") || "Search by name"}
                />
                {search.trim().length >= 4 && (
                  <div className="mt-2 max-h-32 overflow-auto rounded-xl bg-white">
                    {filteredPatients.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${form.patientId === p.id ? "bg-purple-50 font-semibold" : ""}`}
                        onClick={() => {
                          setForm((f) => ({ ...f, patientId: p.id, patient: p.name }));
                          setSearch(p.name);
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                    {filteredPatients.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-500">{t("noResults") || "No patients found"}</p>
                    )}
                  </div>
                )}
                {search.trim().length < 4 && (
                  <p className="px-1 py-1 text-[11px] text-gray-500 mt-1">{t("typeMoreToSearch") || "Type at least 4 characters"}</p>
                )}
                {form.patient && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-1">
                    <span>{t("selected") || "Selected"}: {form.patient}</span>
                    <button
                      type="button"
                      className="text-purple-600 font-semibold hover:text-purple-700"
                      onClick={() => {
                        setForm((f) => ({ ...f, patientId: "", patient: "" }));
                        setSearch("");
                      }}
                    >
                      {t("clearSelection") || "Clear"}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("pharmacyName") || "Pharmacy"}</label>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={pharmacySearch}
                  onChange={(e) => setPharmacySearch(e.target.value)}
                  placeholder={t("searchPharmacy") || "Search pharmacy"}
                />
                {pharmacySearch.trim().length >= 2 && (
                  <div className="mt-2 max-h-32 overflow-auto rounded-xl bg-white">
                    {filteredPharmacies.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${form.pharmacyId === p.id ? "bg-purple-50 font-semibold" : ""}`}
                        onClick={() => {
                          setForm((f) => ({ ...f, pharmacyId: p.id, pharmacy: p.name }));
                          setPharmacySearch(p.name);
                        }}
                      >
                        {p.name}
                      </button>
                    ))}
                    {filteredPharmacies.length === 0 && (
                      <p className="px-3 py-2 text-xs text-gray-500">{t("noResults") || "No pharmacies found"}</p>
                    )}
                  </div>
                )}
                {pharmacySearch.trim().length < 2 && (
                  <p className="px-1 py-1 text-[11px] text-gray-500 mt-1">{t("typeMoreToSearchShort") || "Type 2+ characters"}</p>
                )}
                {form.pharmacy && (
                  <div className="flex items-center gap-2 text-[11px] text-gray-600 mt-1">
                    <span>{t("selected") || "Selected"}: {form.pharmacy}</span>
                    <button
                      type="button"
                      className="text-purple-600 font-semibold hover:text-purple-700"
                      onClick={() => {
                        setForm((f) => ({ ...f, pharmacyId: "", pharmacy: "" }));
                        setPharmacySearch("");
                      }}
                    >
                      {t("clearSelection") || "Clear"}
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("reciepeTitle") || "Reciepe title"}</label>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("medicinesLabel") || "Medicines"}</label>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={form.medicines}
                  onChange={(e) => setForm((f) => ({ ...f, medicines: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("dosageLabel") || "Dosage"}</label>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={form.dosage}
                  onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("notesLabel")}</label>
                <textarea
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>
              <SignaturePad onChange={(dataUrl) => setSignatureUrl(dataUrl)} />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full bg-purple-600 text-white px-4 py-2 text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-60"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (t("sending") || "Sending...") : (t("issueReciepe") || "Issue reciepe")}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

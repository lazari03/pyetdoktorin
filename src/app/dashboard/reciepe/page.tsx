"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Modal from "@/presentation/components/Modal/Modal";
import { fetchAdminUsers } from '@/network/adminUsers';
import { BackendError } from '@/network/backendClient';
import type { ReciepePayload } from "@/application/ports/IReciepeService";
import { UserRole } from '@/domain/entities/UserRole';
import Link from "next/link";
import Image from "next/image";
import { EmailAuthProvider, getAuth, reauthenticateWithCredential } from "firebase/auth";

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
  const { getUserProfileUseCase, createReciepeUseCase, getReciepesByDoctorUseCase } = useDI();
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
  const [savedSignatureUrl, setSavedSignatureUrl] = useState<string>("");
  const [signatureLoaded, setSignatureLoaded] = useState(false);
  const [password, setPassword] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIssuedModal, setShowIssuedModal] = useState(false);
  const toReciepe = useCallback((p: ReciepePayload): Reciepe => ({
    id: p.id || "",
    patientId: p.patientId,
    patient: p.patientName,
    pharmacyId: p.pharmacyId,
    pharmacy: p.pharmacyName,
    title: p.title || t("reciepeTitleDoctor") || "Reciepe",
    medicines: Array.isArray(p.medicines) ? p.medicines.join(', ') : String(p.medicines ?? ''),
    dosage: p.dosage || "",
    notes: p.notes,
    date: new Date(p.createdAt ?? Date.now()).toISOString().split("T")[0],
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

  useEffect(() => {
    const loadSignature = async () => {
      if (!user?.uid) return;
      try {
        const profile = await getUserProfileUseCase.execute(user.uid);
        setSavedSignatureUrl(profile?.signatureDataUrl || "");
      } catch {
        setSavedSignatureUrl("");
      } finally {
        setSignatureLoaded(true);
      }
    };
    loadSignature();
  }, [user?.uid, getUserProfileUseCase]);

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

  const reauthenticate = async (passwordValue: string) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error(t("notAuthenticated") || "User not authenticated.");
    }
    const email = currentUser.email || user?.email;
    if (!email) {
      throw new Error(t("missingEmail") || "Missing email for re-authentication.");
    }
    const credential = EmailAuthProvider.credential(email, passwordValue);
    await reauthenticateWithCredential(currentUser, credential);
    await currentUser.getIdToken(true);
  };

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
    if (!savedSignatureUrl) {
      setSubmitError(t("missingSignatureProfile") || "Please add your signature in your profile before issuing a reciepe.");
      return;
    }
    if (!password) {
      setSubmitError(t("confirmPasswordRequired") || "Please confirm your password to issue a reciepe.");
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
      await reauthenticate(password);
      const created = await createReciepeUseCase.execute({
        patientId: form.patientId,
        patientName: form.patient,
        pharmacyId: form.pharmacyId,
        pharmacyName: form.pharmacy || '',
        doctorId: user?.uid,
        doctorName: user?.name || '',
        medicines: medicineList,
        dosage: form.dosage,
        notes: form.notes,
        title: form.title,
        signatureDataUrl: savedSignatureUrl,
      });
      setReciepes((prev) => [toReciepe(created), ...prev]);
      setForm({ patientId: '', patient: '', pharmacyId: '', pharmacy: '', title: '', medicines: '', dosage: '', notes: '' });
      setSearch('');
      setPharmacySearch('');
      setPassword('');
      setShowIssuedModal(true);
    } catch (error) {
      const code = typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
      if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setSubmitError(t("invalidPassword") || "Incorrect password. Please try again.");
      } else if (code === "auth/too-many-requests") {
        setSubmitError(t("tooManyAttempts") || "Too many attempts. Please wait and try again.");
      } else if (error instanceof BackendError && error.code === "REAUTH_REQUIRED") {
        setSubmitError(t("confirmPasswordRequired") || "Please confirm your password to issue a reciepe.");
      } else if (error instanceof BackendError && error.code === "MISSING_SIGNATURE") {
        setSubmitError(t("missingSignatureProfile") || "Please add your signature in your profile before issuing a reciepe.");
      } else {
        const message = error instanceof Error ? error.message : (t("unknownError") || "Failed to issue prescription.");
        setSubmitError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPdf = (r: Reciepe) => {
    const serial = r.id;
    const w = window.open("", "_blank", "width=800,height=900");
    if (!w) return;
    const doc = w.document;
    doc.open();
    doc.write("<!doctype html><html><head><title>Reciepe</title></head><body></body></html>");
    doc.close();
    const container = doc.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.padding = "24px";
    container.style.maxWidth = "700px";
    container.style.margin = "0 auto";
    container.style.color = "#1f2937";

    const heading = doc.createElement("h2");
    heading.style.margin = "0 0 12px";
    heading.style.color = "#4c1d95";
    heading.textContent = `Reciepe • ${serial}`;
    container.appendChild(heading);

    const meta = [
      `Issued by pyetdoktorin.al`,
      `Status: ${r.status ?? "pending"}`,
      `Date: ${r.date}`,
    ];
    meta.forEach((text) => {
      const p = doc.createElement("p");
      p.style.margin = "4px 0";
      p.style.fontSize = "13px";
      p.textContent = text;
      container.appendChild(p);
    });

    const hr = doc.createElement("hr");
    hr.style.margin = "16px 0";
    container.appendChild(hr);

    const addRow = (label: string, value: string) => {
      const p = doc.createElement("p");
      p.style.margin = "4px 0";
      p.style.fontSize = "14px";
      const strong = doc.createElement("strong");
      strong.textContent = `${label}: `;
      p.appendChild(strong);
      p.appendChild(doc.createTextNode(value));
      container.appendChild(p);
    };

    addRow("Patient", r.patient);
    addRow("Pharmacy", r.pharmacy ?? "-");
    addRow("Title", r.title);
    addRow("Medicines", r.medicines);
    addRow("Dosage", r.dosage);
    if (r.notes) addRow("Notes", r.notes);

    if (r.signatureDataUrl) {
      const sigWrap = doc.createElement("div");
      sigWrap.style.marginTop = "16px";
      const label = doc.createElement("p");
      label.style.margin = "0 0 6px";
      label.style.fontSize = "14px";
      label.textContent = "Doctor signature";
      const img = doc.createElement("img");
      img.src = r.signatureDataUrl;
      img.style.maxWidth = "300px";
      img.style.border = "1px solid #e5e7eb";
      sigWrap.appendChild(label);
      sigWrap.appendChild(img);
      container.appendChild(sigWrap);
    }

    const footer = doc.createElement("p");
    footer.style.marginTop = "24px";
    footer.style.fontSize = "12px";
    footer.style.color = "#6b7280";
    footer.textContent = "pyetdoktorin.al • Secure prescription";
    container.appendChild(footer);

    doc.body.appendChild(container);
    w.focus();
    w.print();
  };

  useEffect(() => {
    const loadReciepes = async () => {
      if (!user?.uid) return;
      try {
        const response = await getReciepesByDoctorUseCase.execute(user.uid);
        const mapped = (response || []).map(toReciepe);
        setReciepes(mapped);
      } catch {
        setReciepes([]);
      }
    };
    loadReciepes();
  }, [user?.uid, toReciepe, getReciepesByDoctorUseCase]);

  if (role !== UserRole.Doctor) {
    return <RedirectingModal show />;
  }

  return (
    <div className="min-h-screen py-6 px-3">
      <Modal isOpen={showIssuedModal} onClose={() => setShowIssuedModal(false)}>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("reciepeIssuedTitle") || "Reciepe issued"}
          </h3>
          <p className="text-sm text-gray-600">
            {t("reciepeIssuedBody") || "The reciepe has been issued successfully."}
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowIssuedModal(false)}
              className="inline-flex items-center rounded-full bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
            >
              {t("close") || "Close"}
            </button>
          </div>
        </div>
      </Modal>
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
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 mt-1">
                    <span className="break-words">{t("selected") || "Selected"}: {form.patient}</span>
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
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-600 mt-1">
                    <span className="break-words">{t("selected") || "Selected"}: {form.pharmacy}</span>
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
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-gray-700">{t("doctorSignature") || "Doctor signature"}</p>
                  <Link href="/dashboard/myprofile" className="text-[11px] font-semibold text-purple-600 hover:text-purple-700">
                    {t("manageSignature") || "Manage signature"}
                  </Link>
                </div>
                {!signatureLoaded ? (
                  <p className="text-xs text-gray-500">{t("loadingSignature") || "Loading signature..."}</p>
                ) : savedSignatureUrl ? (
                  <Image
                    src={savedSignatureUrl}
                    alt={t("doctorSignature") || "Doctor signature"}
                    width={300}
                    height={120}
                    unoptimized
                    className="max-w-[260px] border border-gray-200 bg-white p-2 h-auto w-auto"
                  />
                ) : (
                  <p className="text-xs text-gray-600">
                    {t("missingSignatureProfile") || "Please add your signature in your profile before issuing a reciepe."}
                  </p>
                )}
                <p className="text-[11px] text-gray-500">
                  {t("signatureAppliedOnIssue") || "Signature will be applied after password confirmation."}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{t("confirmPassword") || "Confirm password"}</label>
                <input
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
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

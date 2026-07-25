"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useDI } from "@/context/DIContext";
import { useReciepeStore } from "@/store/reciepeStore";
import { useTranslation } from "react-i18next";
import RedirectingModal from "@/presentation/components/RedirectingModal/RedirectingModal";
import Modal from "@/presentation/components/Modal/Modal";
import { BackendError } from '@/application/errors/BackendError';
import type { ReciepePayload } from "@/application/ports/IReciepeService";
import { UserRole } from '@/domain/entities/UserRole';
import Link from "next/link";
import Image from "next/image";
import { DASHBOARD_PATHS } from "@/navigation/paths";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';
import { notifyFormSubmission } from "@/presentation/utils/formNotifications";
import { PillIcon, ClipboardIcon } from "@/presentation/components/icons/MiniIcons";
import { initialsOf } from "@/presentation/utils/initials";

const inputClass = "w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500";
const fieldLabelClass = "block text-[11px] font-semibold uppercase tracking-wide text-gray-500 mb-1";
const RECIEPES_PAGE_SIZE = 6;

type Reciepe = {
  id: string;
  patientId: string;
  patient: string;
  type: "standard" | "reimbursement";
  reimbursementCode?: string;
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
  const { getUserProfileUseCase, createReciepeUseCase, reauthenticateUseCase, getUsersByRoleUseCase, getPharmaciesUseCase } = useDI();
  const [showPassword, setShowPassword] = useState(false);
  // Shared with dashboard/reciepes/page.tsx (patient), pharmacy pages, and
  // useNotificationsLogic, so this list is fetched once per doctor instead of
  // independently per consumer.
  const rawReciepes = useReciepeStore((s) => s.reciepes);
  const fetchReciepes = useReciepeStore((s) => s.fetchReciepes);
  const setRawReciepes = useReciepeStore((s) => s.setReciepes);
  const [patients, setPatients] = useState<{ id: string; name: string }[]>([]);
  const [pharmacies, setPharmacies] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [form, setForm] = useState<Omit<Reciepe, "id" | "date">>({
    patientId: "",
    patient: "",
    type: "standard",
    reimbursementCode: "",
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
  const [statusFilter, _setStatusFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [reciepesPage, setReciepesPage] = useState(0);
  const toReciepe = useCallback((p: ReciepePayload): Reciepe => ({
    id: p.id || "",
    patientId: p.patientId,
    patient: p.patientName,
    type: p.type || "standard",
    reimbursementCode: p.reimbursementCode,
    pharmacyId: p.pharmacyId,
    pharmacy: p.pharmacyName,
    title: p.title || (p.type === "reimbursement" ? (t("prescriptionTypeReimbursement") || "Reimbursement") : (t("reciepeTitleDoctor") || "Reciepe")),
    medicines: Array.isArray(p.medicines) ? p.medicines.join(', ') : String(p.medicines ?? ''),
    dosage: p.dosage || "",
    notes: p.notes,
    date: new Date(p.createdAt ?? Date.now()).toISOString().split("T")[0],
    status: p.status,
    signatureDataUrl: p.signatureDataUrl,
  }), [t]);

  const loadAll = useCallback(async () => {
    if (!user?.uid || !role) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [patientsRaw, pharmacies, profile] = await Promise.all([
        getUsersByRoleUseCase.execute(UserRole.Patient, 500),
        getPharmaciesUseCase.execute(),
        getUserProfileUseCase.execute(user.uid),
        fetchReciepes(role, user.uid, true),
      ]);

      const pts = (patientsRaw as unknown as Record<string, unknown>[]).map((u) => ({
        id: String(u.id ?? ''),
        name:
          `${u.name ?? ''} ${u.surname ?? ''}`.trim() ||
          String(u.email ?? '') ||
          'Unknown',
      }));
      setPatients(pts);
      setPharmacies(pharmacies);

      setSavedSignatureUrl(profile?.signatureDataUrl || '');
      setSignatureLoaded(true);
    } catch (err) {
      setPatients([]);
      setPharmacies([]);
      setSavedSignatureUrl('');
      setSignatureLoaded(true);
      setLoadError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchReciepes, getPharmaciesUseCase, getUserProfileUseCase, getUsersByRoleUseCase, role, user?.uid]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const reciepes = useMemo(() => rawReciepes.map(toReciepe), [rawReciepes, toReciepe]);

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
    await reauthenticateUseCase.execute(passwordValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!form.patientId || !user?.uid) {
      setSubmitError(t("missingRequiredFields") || "Please fill out all required fields.");
      return;
    }
    if (!form.patient) {
      setSubmitError(t("missingRequiredFields") || "Please fill out all required fields.");
      return;
    }
    if (form.type === "standard" && (!form.pharmacyId || !form.pharmacy)) {
      setSubmitError(t("prescriptionPharmacyRequired") || "Please select a pharmacy for a standard prescription.");
      return;
    }
    if (form.type === "reimbursement" && !form.reimbursementCode?.trim()) {
      setSubmitError(t("reimbursementCodeRequired") || "Please enter the reimbursement code.");
      return;
    }
    if (form.type === "reimbursement" && !pharmacySearch.trim()) {
      setSubmitError(t("reimbursementPharmacyRequired") || "Please enter the pharmacy name for reimbursement.");
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
    const medicineList = form.type === "standard"
      ? form.medicines
          .split(/[\n,]+/)
          .map((m) => m.trim())
          .filter(Boolean)
      : [];
    const reimbursementPharmacyInput = pharmacySearch.trim();
    const matchedReimbursementPharmacy = form.type === "reimbursement"
      ? pharmacies.find((p) => p.name.trim().toLowerCase() === reimbursementPharmacyInput.toLowerCase())
      : undefined;
    const reimbursementPharmacyName = form.type === "reimbursement"
      ? (matchedReimbursementPharmacy?.name ?? reimbursementPharmacyInput)
      : "";
    if (form.type === "standard" && medicineList.length === 0) {
      setSubmitError(t("missingMedicines") || "Please add at least one medicine.");
      return;
    }
    try {
      setIsSubmitting(true);
      await reauthenticate(password);
      const created = await createReciepeUseCase.execute({
        patientId: form.patientId,
        patientName: form.patient,
        type: form.type,
        reimbursementCode: form.reimbursementCode?.trim() || undefined,
        pharmacyId: form.type === "standard" ? form.pharmacyId : matchedReimbursementPharmacy?.id,
        pharmacyName: form.type === "standard" ? (form.pharmacy || '') : reimbursementPharmacyName,
        doctorId: user?.uid,
        doctorName: user?.name || '',
        medicines: medicineList,
        dosage: form.type === "standard" ? form.dosage : "",
        notes: form.type === "standard" ? form.notes : undefined,
        title: form.type === "standard" ? form.title : undefined,
        signatureDataUrl: savedSignatureUrl,
      });
      void notifyFormSubmission({
        formType: 'prescription_issued',
        source: 'doctor_reciepe_page',
        subject: `Prescription issued for ${form.patient}`,
        replyTo: user?.email || undefined,
        data: {
          doctorId: user?.uid || '',
          doctorName: user?.name || '',
          doctorEmail: user?.email || '',
          type: form.type,
          reimbursementCode: form.reimbursementCode?.trim() || '',
          patientId: form.patientId,
          patientName: form.patient,
          pharmacyId: form.type === "standard" ? (form.pharmacyId || '') : (matchedReimbursementPharmacy?.id || ''),
          pharmacyName: form.type === "standard" ? (form.pharmacy || '') : reimbursementPharmacyName,
          title: form.type === "standard" ? form.title : '',
          medicines: medicineList,
          dosage: form.type === "standard" ? form.dosage : '',
          notes: form.type === "standard" ? (form.notes || '') : '',
        },
      });
      setRawReciepes([created, ...rawReciepes]);
      setForm({
        patientId: '',
        patient: '',
        type: 'standard',
        reimbursementCode: '',
        pharmacyId: '',
        pharmacy: '',
        title: '',
        medicines: '',
        dosage: '',
        notes: '',
      });
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
    addRow("Type", r.type === "reimbursement" ? "Reimbursement" : "Standard");
    if (r.reimbursementCode) addRow("Reimbursement code", r.reimbursementCode);
    if (r.type === "reimbursement") addRow("Pharmacy", r.pharmacy ?? "-");
    if (r.type === "standard") {
      addRow("Pharmacy", r.pharmacy ?? "-");
      addRow("Title", r.title);
      addRow("Medicines", r.medicines);
      addRow("Dosage", r.dosage);
      if (r.notes) addRow("Notes", r.notes);
    }

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

  const filteredReciepes = reciepes.filter((r) => statusFilter === "all" || r.status === statusFilter);
  const reciepesTotalPages = Math.max(1, Math.ceil(filteredReciepes.length / RECIEPES_PAGE_SIZE));
  const pagedReciepes = filteredReciepes.slice(
    reciepesPage * RECIEPES_PAGE_SIZE,
    reciepesPage * RECIEPES_PAGE_SIZE + RECIEPES_PAGE_SIZE
  );

  useEffect(() => {
    setReciepesPage(0);
  }, [statusFilter]);

  useEffect(() => {
    if (reciepesPage > reciepesTotalPages - 1) setReciepesPage(0);
  }, [reciepesPage, reciepesTotalPages]);

  if (role !== UserRole.Doctor) {
    return <RedirectingModal show />;
  }

  return (
    <RequestStateGate
      loading={loading && reciepes.length === 0}
      error={loadError}
      onRetry={loadAll}
      homeHref={DASHBOARD_PATHS.root}
      loadingLabel={t("loading")}
      skeleton={<StatsPageSkeleton />}
      analyticsPrefix="dashboard.reciepe"
    >
      <div className="page">
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
        <div className="page-inner page-inner-md">
          <div>
            <p className="page-eyebrow">{t("secureAccessEyebrow") || "Secure access"}</p>
            <h1 className="page-title">{t("reciepeTitleDoctor") || "Prescriptions"}</h1>
            <p className="page-subtitle">{t("reciepeSubtitleDoctor") || "Issue prescriptions and keep a clear record for your patients."}</p>
          </div>

          <div className="split-layout">
            <section className="panel">
              <div className="section-hd">
                <h2 className="section-title">{t("reciepeList") || "Issued prescriptions"}</h2>
              </div>
              <div className="space-y-3">
                {filteredReciepes.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4">{t("noReciepes") || "No reciepes found."}</p>
                ) : (
                  pagedReciepes.map((r) => (
                    <div key={r.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                      <div className="flex items-center gap-2.5">
                        <span className="h-8 w-8 shrink-0 rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center text-[11px] font-bold">
                          {initialsOf(r.patient)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900 truncate">{r.title}</p>
                          <p className="text-[11.5px] text-gray-500 truncate">{r.patient}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          {r.status ? (
                            <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                              r.status === "accepted"
                                ? "bg-green-50 text-green-700"
                                : r.status === "rejected"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-amber-50 text-amber-700"
                            }`}>
                              {t(r.status)}
                            </span>
                          ) : null}
                          <span className="text-[10.5px] text-gray-400">{r.date}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600">
                        <span className={`rounded-full px-2 py-0.5 font-semibold ${
                          r.type === "reimbursement"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {r.type === "reimbursement"
                            ? (t("prescriptionTypeReimbursement") || "Reimbursement")
                            : (t("prescriptionTypeStandard") || "Standard")}
                        </span>
                        {r.reimbursementCode ? (
                          <span>{(t("reimbursementCodeLabel") || "Reimbursement code")}: {r.reimbursementCode}</span>
                        ) : null}
                        {r.type === "reimbursement" ? (
                          <span>{(t("pharmacyName") || "Pharmacy")}: {r.pharmacy || "-"}</span>
                        ) : null}
                      </div>

                      {r.type === "standard" ? (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                          <p className="flex items-center gap-1.5 min-w-0 truncate">
                            <PillIcon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                            {r.medicines}
                          </p>
                          <p className="flex items-center gap-1.5 min-w-0 truncate">
                            <ClipboardIcon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                            {r.dosage}
                          </p>
                          {r.notes ? <p className="col-span-2 text-gray-500 truncate">{r.notes}</p> : null}
                        </div>
                      ) : null}

                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => downloadPdf(r)}
                          className="text-[11px] font-semibold text-purple-700 hover:text-purple-800"
                        >
                          {t("download") || "Download"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {reciepesTotalPages > 1 && (
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setReciepesPage((p) => Math.max(0, p - 1))}
                    disabled={reciepesPage === 0}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11.5px] font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    {t("previous") || "Previous"}
                  </button>
                  <span className="text-[11.5px] text-gray-500">
                    {t("page") || "Page"} {reciepesPage + 1} / {reciepesTotalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setReciepesPage((p) => Math.min(reciepesTotalPages - 1, p + 1))}
                    disabled={reciepesPage >= reciepesTotalPages - 1}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11.5px] font-semibold text-gray-600 hover:border-purple-300 hover:text-purple-700 disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-600"
                  >
                    {t("next") || "Next"}
                  </button>
                </div>
              )}
            </section>

            <section className="panel panel-tinted">
              <div className="section-hd">
                <h2 className="section-title">{t("newReciepe") || "New prescription"}</h2>
              </div>
              <form className="space-y-3" onSubmit={handleSubmit}>
                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {submitError}
                  </div>
                )}
                <div>
                  <label className={fieldLabelClass}>{t("prescriptionTypeLabel") || "Prescription type"}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: "standard", label: t("prescriptionTypeStandard") || "Standard" },
                      { value: "reimbursement", label: t("prescriptionTypeReimbursement") || "Reimbursement" },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          form.type === option.value
                            ? "border-purple-400 bg-purple-50 text-purple-700"
                            : "border-gray-200 text-gray-700 hover:border-purple-200"
                        }`}
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            type: option.value,
                            reimbursementCode: option.value === "reimbursement" ? current.reimbursementCode : "",
                            pharmacyId: option.value === "standard" ? current.pharmacyId : "",
                            pharmacy: option.value === "standard" ? current.pharmacy : "",
                            title: option.value === "standard" ? current.title : "",
                            medicines: option.value === "standard" ? current.medicines : "",
                            dosage: option.value === "standard" ? current.dosage : "",
                            notes: option.value === "standard" ? current.notes : "",
                          }));
                          if (option.value !== "standard") {
                            setPharmacySearch("");
                          }
                        }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label htmlFor="patient-search" className="block text-xs font-medium text-gray-700 mb-1">{t("patientName")}</label>
                  <input
                    id="patient-search"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("searchByName") || "Search by name"}
                    aria-autocomplete="list"
                    aria-expanded={search.trim().length >= 4}
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
              {form.type === "reimbursement" ? (
                <div>
                  <label className={fieldLabelClass}>
                    {t("reimbursementCodeLabel") || "Reimbursement code"}
                  </label>
                  <input
                    className={inputClass}
                    value={form.reimbursementCode || ""}
                    onChange={(e) => setForm((f) => ({ ...f, reimbursementCode: e.target.value }))}
                    placeholder={t("reimbursementCodePlaceholder") || "Enter patient reimbursement code"}
                    required
                  />
                  <p className="px-1 py-1 text-[11px] text-gray-500 mt-1">
                    {t("reimbursementCodeHelper") || "This code will also be saved on the patient's account in Firebase."}
                  </p>
                  <label htmlFor="reimbursement-pharmacy-search" className="block text-xs font-medium text-gray-700 mb-1 mt-2">
                    {t("pharmacyName") || "Pharmacy"}
                  </label>
                  <input
                    id="reimbursement-pharmacy-search"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={pharmacySearch}
                    aria-autocomplete="list"
                    aria-expanded={pharmacySearch.trim().length >= 2}
                    onChange={(e) => {
                      const value = e.target.value;
                      setPharmacySearch(value);
                      setForm((f) => ({ ...f, pharmacyId: "", pharmacy: value }));
                    }}
                    placeholder={t("reimbursementPharmacyPlaceholder") || "Type pharmacy name"}
                    required
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
                  <p className="px-1 py-1 text-[11px] text-gray-500 mt-1">
                    {t("reimbursementPharmacyCaseInsensitive") || "Pharmacy name matching is case-insensitive."}
                  </p>
                </div>
              ) : null}
              {form.type === "standard" ? (
                <>
                  <div>
                    <label htmlFor="standard-pharmacy-search" className="block text-xs font-medium text-gray-700 mb-1">{t("pharmacyName") || "Pharmacy"}</label>
                    <input
                      id="standard-pharmacy-search"
                      className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      value={pharmacySearch}
                      onChange={(e) => setPharmacySearch(e.target.value)}
                      placeholder={t("searchPharmacy") || "Search pharmacy"}
                      aria-autocomplete="list"
                      aria-expanded={pharmacySearch.trim().length >= 2}
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
                    <label className={fieldLabelClass}>{t("reciepeTitle") || "Reciepe title"}</label>
                    <input
                      className={inputClass}
                      value={form.title}
                      onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>{t("medicinesLabel") || "Medicines"}</label>
                    <input
                      className={inputClass}
                      value={form.medicines}
                      onChange={(e) => setForm((f) => ({ ...f, medicines: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>{t("dosageLabel") || "Dosage"}</label>
                    <input
                      className={inputClass}
                      value={form.dosage}
                      onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className={fieldLabelClass}>{t("notesLabel")}</label>
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={form.notes}
                      onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-600 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2">
                  {t("reimbursementSimpleModeHelp") || "For reimbursement prescriptions, only patient and reimbursement code are required. Medicines and dosage are not included."}
                </p>
              )}
	              <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 space-y-2">
	                <div className="flex items-center justify-between">
	                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{t("doctorSignature") || "Doctor signature"}</p>
	                  <Link href={DASHBOARD_PATHS.profile} className="text-[11px] font-semibold text-purple-700 hover:text-purple-800">
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
                <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-700 mb-1">{t("confirmPassword") || "Confirm password"}</label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-gray-200 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? (t("hidePassword") || "Hide password") : (t("showPassword") || "Show password")}
                  >
                    {showPassword ? (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    ) : (
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
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
    </RequestStateGate>
  );
}

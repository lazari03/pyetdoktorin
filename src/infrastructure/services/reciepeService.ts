import type { IReciepeService, ReciepePayload } from "@/application/ports/IReciepeService";
import type { Prescription } from "@/network/prescriptions";
import { createPrescription, fetchPrescriptions, updatePrescriptionStatus } from "@/network/prescriptions";

const mapPrescription = (p: Prescription): ReciepePayload => ({
  id: p.id,
  patientId: p.patientId,
  patientName: p.patientName,
  type: p.type,
  reimbursementCode: p.reimbursementCode,
  pharmacyId: p.pharmacyId,
  pharmacyName: p.pharmacyName,
  doctorId: p.doctorId,
  doctorName: p.doctorName,
  title: p.title,
  medicines: Array.isArray(p.medicines) ? p.medicines : [],
  dosage: p.dosage || "",
  notes: p.notes,
  status: p.status,
  createdAt: p.createdAt,
  signatureDataUrl: p.signatureDataUrl,
  statusUpdatedAt: p.statusUpdatedAt,
});

// Module-level cache shared across all ReciepeService instances.
// Prevents duplicate network calls when listByDoctor, listByPatient,
// and listByPharmacy are all called in the same session.
const CACHE_TTL = 30_000; // 30 seconds

let cache: {
  data: ReciepePayload[] | null;
  fetchedAt: number;
  inflight: Promise<ReciepePayload[]> | null;
} = { data: null, fetchedAt: 0, inflight: null };

async function fetchAll(): Promise<ReciepePayload[]> {
  const now = Date.now();

  // Return cached data if it's still fresh.
  if (cache.data !== null && now - cache.fetchedAt < CACHE_TTL) {
    return cache.data;
  }

  // Deduplicate concurrent callers — return the same promise to all of them.
  if (cache.inflight !== null) {
    return cache.inflight;
  }

  cache.inflight = fetchPrescriptions()
    .then((response) => {
      const mapped = (response.items || []).map(mapPrescription);
      cache = { data: mapped, fetchedAt: Date.now(), inflight: null };
      return mapped;
    })
    .catch((err) => {
      cache = { ...cache, inflight: null };
      throw err;
    });

  return cache.inflight;
}

function invalidateCache(): void {
  cache = { data: null, fetchedAt: 0, inflight: null };
}

export class ReciepeService implements IReciepeService {
  async createReciepe(data: ReciepePayload): Promise<ReciepePayload> {
    const created = await createPrescription({
      patientId: data.patientId,
      patientName: data.patientName,
      type: data.type,
      reimbursementCode: data.reimbursementCode,
      pharmacyId: data.pharmacyId,
      pharmacyName: data.pharmacyName,
      doctorName: data.doctorName,
      medicines: data.medicines,
      dosage: data.dosage,
      notes: data.notes,
      title: data.title,
      signatureDataUrl: data.signatureDataUrl,
    });
    invalidateCache();
    return mapPrescription(created);
  }

  async listByDoctor(doctorId: string): Promise<ReciepePayload[]> {
    const all = await fetchAll();
    return all
      .filter((p) => p.doctorId === doctorId)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async listByPatient(patientId: string): Promise<ReciepePayload[]> {
    const all = await fetchAll();
    return all
      .filter((p) => p.patientId === patientId)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async listByPharmacy(pharmacyId: string): Promise<ReciepePayload[]> {
    const all = await fetchAll();
    return all
      .filter((p) => (p.pharmacyId ?? "") === pharmacyId)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async updateStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
    await updatePrescriptionStatus(id, status);
    invalidateCache();
  }
}

import type { IReciepeService, ReciepePayload } from "@/application/ports/IReciepeService";
import type { Prescription } from "@/network/prescriptions";
import { createPrescription, fetchPrescriptions, updatePrescriptionStatus } from "@/network/prescriptions";

const mapPrescription = (p: Prescription): ReciepePayload => ({
  id: p.id,
  patientId: p.patientId,
  patientName: p.patientName,
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

export class ReciepeService implements IReciepeService {
  async createReciepe(data: ReciepePayload): Promise<ReciepePayload> {
    const created = await createPrescription({
      patientId: data.patientId,
      patientName: data.patientName,
      pharmacyId: data.pharmacyId,
      pharmacyName: data.pharmacyName,
      doctorName: data.doctorName,
      medicines: data.medicines,
      dosage: data.dosage,
      notes: data.notes,
      title: data.title,
      signatureDataUrl: data.signatureDataUrl,
    });
    return mapPrescription(created);
  }

  async listByDoctor(doctorId: string): Promise<ReciepePayload[]> {
    const response = await fetchPrescriptions();
    return (response.items || [])
      .filter((p) => p.doctorId === doctorId)
      .map(mapPrescription)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async listByPatient(patientId: string): Promise<ReciepePayload[]> {
    const response = await fetchPrescriptions();
    return (response.items || [])
      .filter((p) => p.patientId === patientId)
      .map(mapPrescription)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async listByPharmacy(pharmacyId: string): Promise<ReciepePayload[]> {
    const response = await fetchPrescriptions();
    return (response.items || [])
      .filter((p) => (p.pharmacyId ?? "") === pharmacyId)
      .map(mapPrescription)
      .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }

  async updateStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
    await updatePrescriptionStatus(id, status);
  }
}

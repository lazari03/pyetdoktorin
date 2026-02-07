import { backendFetch } from './backendClient';

export type PrescriptionStatus = 'pending' | 'accepted' | 'rejected';

export interface Prescription {
  id: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
  patientName: string;
  pharmacyId?: string;
  pharmacyName?: string;
  medicines: string[];
  dosage?: string;
  notes?: string;
  title?: string;
  signatureDataUrl?: string;
  encrypted?: boolean;
  encryptedSignature?: string;
  encryptedNotes?: string;
  status: PrescriptionStatus;
  createdAt: number;
}

export interface PrescriptionListResponse {
  items: Prescription[];
}

export interface CreatePrescriptionPayload {
  patientId: string;
  patientName: string;
  pharmacyId?: string;
  pharmacyName?: string;
  doctorName?: string;
  medicines: string[];
  dosage?: string;
  notes?: string;
  title?: string;
  signatureDataUrl?: string;
  encrypted?: boolean;
  encryptedSignature?: string;
  encryptedNotes?: string;
}

export async function fetchPrescriptions() {
  return backendFetch<PrescriptionListResponse>('/api/prescriptions');
}

export async function createPrescription(payload: CreatePrescriptionPayload) {
  return backendFetch<Prescription>('/api/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePrescriptionStatus(id: string, status: PrescriptionStatus) {
  return backendFetch(`/api/prescriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

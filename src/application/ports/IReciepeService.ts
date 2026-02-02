import type { EncryptedPayload } from "@/presentation/utils/crypto";

export type ReciepePayload = {
  id?: string;
  patientId: string;
  patientName: string;
  pharmacyId: string;
  pharmacyName: string;
  doctorId: string;
  doctorName?: string;
  title: string;
  medicines: string;
  dosage: string;
  notes?: string;
  status?: "pending" | "accepted" | "rejected";
  createdAt: string; // ISO
  signatureDataUrl?: string;
  encryptedSignature?: EncryptedPayload;
  encryptedNotes?: EncryptedPayload;
  encrypted?: boolean;
};

export interface IReciepeService {
  createReciepe(data: ReciepePayload): Promise<string>;
  listByDoctor(doctorId: string): Promise<ReciepePayload[]>;
  listByPatient(patientId: string): Promise<ReciepePayload[]>;
  listByPharmacy(pharmacyId: string): Promise<ReciepePayload[]>;
  updateStatus(id: string, status: "accepted" | "rejected"): Promise<void>;
}

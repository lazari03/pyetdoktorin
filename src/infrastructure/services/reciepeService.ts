import type { IReciepeService, ReciepePayload } from "@/application/ports/IReciepeService";
import { db } from "@/config/firebaseconfig";

export class ReciepeService implements IReciepeService {
  async createReciepe(data: ReciepePayload): Promise<string> {
    const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
    const ref = await addDoc(collection(db, "recipe"), {
      ...data,
      status: data.status || "pending",
      createdAt: data.createdAt || new Date().toISOString(),
      createdAtTs: serverTimestamp(),
    });
    return ref.id;
  }

  async listByDoctor(doctorId: string): Promise<ReciepePayload[]> {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const q = query(collection(db, "recipe"), where("doctorId", "==", doctorId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as ReciepePayload) }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  async listByPatient(patientId: string): Promise<ReciepePayload[]> {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const q = query(collection(db, "recipe"), where("patientId", "==", patientId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as ReciepePayload) }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  async listByPharmacy(pharmacyId: string): Promise<ReciepePayload[]> {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    const q = query(collection(db, "recipe"), where("pharmacyId", "==", pharmacyId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as ReciepePayload) }))
      .sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  }

  async updateStatus(id: string, status: "accepted" | "rejected"): Promise<void> {
    const { doc, updateDoc } = await import("firebase/firestore");
    await updateDoc(doc(db, "recipe", id), { status });
  }
}

import type { IPharmacyService, Pharmacy } from "@/application/ports/IPharmacyService";
import { db } from "@/config/firebaseconfig";

export class PharmacyService implements IPharmacyService {
  async listPharmacies(): Promise<Pharmacy[]> {
    const { collection, getDocs, query, where } = await import("firebase/firestore");
    // Prefer user collection entries with role === 'pharmacy' to match current user model
    const userQuery = query(collection(db, "users"), where("role", "==", "pharmacy"));
    const snap = await getDocs(userQuery);
    if (snap.size > 0) {
      return snap.docs.map((d) => {
        const data = d.data() as { name?: string; surname?: string; pharmacyName?: string } | undefined;
        const fullName = `${data?.name ?? ""} ${data?.surname ?? ""}`.trim();
        return {
          id: d.id,
          name: data?.pharmacyName || fullName || "Unnamed pharmacy",
        };
      });
    }
    // fallback to businesses collection if present
    const businessSnap = await getDocs(collection(db, "businesses"));
    return businessSnap.docs.map((d) => {
      const data = d.data() as { name?: string } | undefined;
      return { id: d.id, name: data?.name || "Unnamed pharmacy" };
    });
  }
}

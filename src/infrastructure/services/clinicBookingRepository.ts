import { ClinicBooking, ClinicBookingInput, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { IClinicBookingRepository } from '@/domain/repositories/IClinicBookingRepository';

const COLLECTION = 'clinicBookings';

export class FirebaseClinicBookingRepository implements IClinicBookingRepository {
  async createBooking(input: ClinicBookingInput): Promise<ClinicBooking> {
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore();
    const ref = await addDoc(collection(db, COLLECTION), {
      ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
    return {
      id: ref.id,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...input,
    };
  }

  async getBookingsByClinic(clinicId: string): Promise<ClinicBooking[]> {
    const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const q = query(collection(db, COLLECTION), where('clinicId', '==', clinicId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as ClinicBooking), id: doc.id }));
  }

  async getBookingsByPatient(patientId: string): Promise<ClinicBooking[]> {
    const { getFirestore, collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
    const db = getFirestore();
    const q = query(collection(db, COLLECTION), where('patientId', '==', patientId), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...(doc.data() as ClinicBooking), id: doc.id }));
  }

  async updateBookingStatus(bookingId: string, status: ClinicBookingStatus): Promise<void> {
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore();
    await updateDoc(doc(db, COLLECTION, bookingId), { status });
  }
}

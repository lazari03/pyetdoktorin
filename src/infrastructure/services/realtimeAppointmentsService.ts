import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { IRealtimeAppointmentsService } from '@/application/ports/IRealtimeAppointmentsService';

export class RealtimeAppointmentsService implements IRealtimeAppointmentsService {
  subscribeToPendingAppointments(doctorId: string, onChange: (count: number) => void): () => void {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      onChange(snapshot.empty ? 0 : snapshot.size);
    });
    return () => unsubscribe();
  }

  subscribeToPendingAppointmentNotifications<T>(
    doctorId: string,
    map: (data: Record<string, unknown>) => T,
    onChange: (items: T[]) => void
  ): () => void {
    const q = query(
      collection(db, 'appointments'),
      where('doctorId', '==', doctorId),
      where('status', '==', 'pending')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mapped = snapshot.docs.map((doc) => map({ id: doc.id, ...doc.data() }));
      onChange(mapped);
    });
    return () => unsubscribe();
  }
}

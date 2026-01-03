import { db } from '@/config/firebaseconfig';
import { doc, collection, updateDoc, getDoc } from 'firebase/firestore';

export async function updateAppointmentStatusAndNotify(appointmentId: string, action: 'accepted' | 'rejected') {
  const appointmentRef = doc(collection(db, 'appointments'), appointmentId);
  await updateDoc(appointmentRef, { status: action });
  if (action === 'accepted') {
    const appointmentSnap = await getDoc(appointmentRef);
    if (appointmentSnap.exists()) {
      const { patientId, doctorName } = appointmentSnap.data();
      if (patientId && doctorName) {
        await fetch('/api/sms/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'appointment-accepted',
            patientId,
            doctorName,
          }),
        });
      }
    }
  }
}

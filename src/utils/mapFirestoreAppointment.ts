import { Appointment } from "@/models/Appointment";

/**
 * Normalize Firestore appointment data to the Appointment type.
 * Ensures all required fields are present and defaulted.
 */
export function mapFirestoreAppointment(doc: any): Appointment {
  const data = doc.data ? doc.data() : doc;
  return {
    id: doc.id || data.id || '',
    doctorId: data.doctorId || '',
    doctorName: data.doctorName || 'Unknown',
    patientId: data.patientId || '',
    patientName: data.patientName || 'Unknown',
    appointmentType: data.appointmentType || 'General',
    preferredDate: data.preferredDate || '',
    preferredTime: data.preferredTime || '',
    notes: data.notes || '',
    isPaid: typeof data.isPaid === 'boolean' ? data.isPaid : false,
    createdAt: data.createdAt || new Date().toISOString(),
    status: data.status || 'pending',
  };
}

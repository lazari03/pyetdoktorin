import { Appointment } from "@/models/Appointment";

/**
 * FirestoreDoc type for Firestore document snapshots or plain objects.
 */
export type FirestoreDoc = {
  id?: string;
  data?: () => Record<string, unknown>;
  [key: string]: unknown;
};

/**
 * Normalize Firestore appointment data to the Appointment type.
 * Ensures all required fields are present and defaulted.
 */
export function mapFirestoreAppointment(doc: FirestoreDoc): Appointment {
  const data = typeof doc.data === 'function' ? doc.data() : doc;
  type FirestoreAppointmentData = {
    id?: string;
    doctorId?: string;
    doctorName?: string;
    patientId?: string;
    patientName?: string;
    appointmentType?: string;
    preferredDate?: string;
    preferredTime?: string;
    notes?: string;
    isPaid?: boolean;
    createdAt?: string;
    status?: string;
    roomId?: string;
    [key: string]: unknown;
  };
  const d: FirestoreAppointmentData = data as FirestoreAppointmentData;
  return {
    id: doc.id || d.id || '',
    doctorId: d.doctorId || '',
    doctorName: d.doctorName || 'Unknown',
    patientId: d.patientId || '',
    patientName: d.patientName || 'Unknown',
    appointmentType: d.appointmentType || 'General',
    preferredDate: d.preferredDate || '',
    preferredTime: d.preferredTime || '',
    notes: d.notes || '',
    isPaid: typeof d.isPaid === 'boolean' ? d.isPaid : false,
    createdAt: d.createdAt || new Date().toISOString(),
    status: d.status || 'pending',
    roomId: d.roomId || undefined,
  };
}

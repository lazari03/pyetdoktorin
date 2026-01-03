import { Appointment } from "@/domain/entities/Appointment";
import { AppointmentStatus } from "@/domain/entities/AppointmentStatus";

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
  // Map Firestore string status to AppointmentStatus enum, defaulting to Pending if invalid
  let status: AppointmentStatus;
  switch (d.status) {
    case AppointmentStatus.Accepted:
    case AppointmentStatus.Rejected:
    case AppointmentStatus.Finished:
    case AppointmentStatus.Pending:
      status = d.status as AppointmentStatus;
      break;
    default:
      status = AppointmentStatus.Pending;
  }
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
    status,
    roomId: d.roomId || undefined,
  };
}

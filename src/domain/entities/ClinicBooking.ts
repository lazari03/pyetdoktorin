export type ClinicBookingStatus = 'pending' | 'confirmed' | 'declined';

export interface ClinicBooking {
  id: string;
  clinicId: string;
  clinicName: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  note: string;
  preferredDate?: string;
  status: ClinicBookingStatus;
  createdAt: string;
}

export type ClinicBookingInput = Omit<ClinicBooking, 'id' | 'status' | 'createdAt'>;

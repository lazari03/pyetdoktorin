export interface Appointment {
  id: string;
  date: string;
  preferredDate?: string; // Optional field for preferred date
  preferredTime?: string; // Optional field for preferred time
  doctorName: string;
  status: string;
  notes?: string; // Optional field for additional notes
  patientName?: string; // Optional field for patient name
}

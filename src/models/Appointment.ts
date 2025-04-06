export interface Appointment {
  id: string;
  date: string;
  preferredDate?: string; // Optional field for preferred date
  preferredTime?: string; // Optional field for preferred time
  doctor: string;
  status: string;
  notes?: string; // Optional field for additional notes
}

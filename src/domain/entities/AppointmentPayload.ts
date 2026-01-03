export type AppointmentPayload = {
  doctorId: string;
  appointmentType: string;
  preferredDate: string;
  notes: string;
  status: string;
  patientId: string;
  patientName: string;
};

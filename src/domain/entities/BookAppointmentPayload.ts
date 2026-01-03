import type { AppointmentPayload } from "./AppointmentPayload";

export type BookAppointmentPayload = Omit<AppointmentPayload, 'patientId' | 'patientName'> & Partial<Pick<AppointmentPayload, 'status'>>;

import { Appointment } from '../entities/Appointment';

export function isValidAppointment(appointment: Appointment): boolean {
  // Example rule: must have doctorId, patientId, and preferredDate
  return Boolean(
    appointment.doctorId &&
    appointment.patientId &&
    appointment.preferredDate &&
    appointment.preferredTime &&
    appointment.appointmentType &&
    appointment.status
  );
}

export function isAppointmentPaid(appointment: Appointment): boolean {
  return appointment.isPaid === true;
}

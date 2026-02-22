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

export function isAppointmentAccepted(appointment: Appointment): boolean {
  return (appointment.status || '').toString().toLowerCase() === 'accepted';
}

export function canPatientPay(appointment: Appointment): boolean {
  const paymentStatus = (appointment.paymentStatus || '').toString().toLowerCase();
  const isProcessing = paymentStatus === 'processing';
  return isAppointmentAccepted(appointment) && appointment.isPaid !== true && !isProcessing;
}

export function canJoinAppointment(appointment: Appointment, isPast: boolean): boolean {
  return isAppointmentAccepted(appointment) && appointment.isPaid === true && !isPast;
}

import { Appointment } from '../entities/Appointment';

export function normalizeTo24h(time: string): string {
  const ampmMatch = time.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const period = ampmMatch[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }
  return time;
}

export function isPastAppointment(date: string, time: string, appointmentDurationMinutes: number = 30): boolean {
  const appointmentDateTime = new Date(`${date}T${normalizeTo24h(time)}`);
  const appointmentEndTime = new Date(appointmentDateTime.getTime() + appointmentDurationMinutes * 60000);
  return appointmentEndTime < new Date();
}

export function isAppointmentPast(appointment: Appointment, appointmentDurationMinutes: number = 30): boolean {
  const appointmentDateTime = new Date(`${appointment.preferredDate}T${normalizeTo24h(appointment.preferredTime)}`);
  const appointmentEndTime = new Date(appointmentDateTime.getTime() + appointmentDurationMinutes * 60000);
  return appointmentEndTime < new Date();
}

export function isValidAppointment(appointment: Appointment): boolean {
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

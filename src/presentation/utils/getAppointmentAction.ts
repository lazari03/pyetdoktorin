import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role: UserRole | undefined
): { label: string; disabled: boolean } {
  // Example logic, adapt as needed for your domain
  if (isAppointmentPast(appointment)) {
    return { label: 'Past', disabled: true };
  }
  if (role === 'doctor') {
    if (appointment.status === 'pending') {
      return { label: 'Join Now', disabled: true };
    }
    if (appointment.status === 'accepted') {
      return { label: 'Join Now', disabled: false };
    }
    return { label: 'N/A', disabled: true };
  }
  // Patient
  if (appointment.status === 'pending') {
    return { label: 'Pay Now', disabled: false };
  }
  if (appointment.status === 'accepted') {
    return { label: 'Join Now', disabled: false };
  }
  return { label: 'N/A', disabled: true };
}

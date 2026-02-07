import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role: UserRole | undefined
): { label: string; disabled: boolean } {
  if (isAppointmentPast(appointment)) {
    return { label: 'past', disabled: true };
  }
  if (role === UserRole.Doctor) {
    if (appointment.status === 'accepted') {
      return { label: 'joinNow', disabled: false };
    }
    return { label: 'waitingForPayment', disabled: true };
  }
  // Patient
  if (!appointment.isPaid) {
    return { label: 'payNow', disabled: false };
  }
  return { label: 'joinNow', disabled: false };
}

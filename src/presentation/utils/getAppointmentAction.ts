import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import { AppointmentActionKey } from '@/domain/entities/AppointmentAction';

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role: UserRole | undefined
): { label: string; disabled: boolean } {
  if (isAppointmentPast(appointment)) {
    return { label: AppointmentActionKey.Past, disabled: true };
  }
  const status = (appointment.status || '').toString().toLowerCase();
  if (role === UserRole.Doctor) {
    if (appointment.isPaid) {
      return { label: AppointmentActionKey.JoinNow, disabled: false };
    }
    return { label: AppointmentActionKey.WaitingForPayment, disabled: true };
  }
  // Patient
  if (status === 'pending') {
    return { label: AppointmentActionKey.WaitingForAcceptance, disabled: true };
  }
  if (status === 'rejected' || status === 'declined' || status === 'canceled' || status === 'cancelled') {
    return { label: AppointmentActionKey.Rejected, disabled: true };
  }
  if (status === 'accepted' && !appointment.isPaid) {
    return { label: AppointmentActionKey.PayNow, disabled: false };
  }
  if (status === 'accepted' && appointment.isPaid) {
    return { label: AppointmentActionKey.JoinNow, disabled: false };
  }
  return { label: AppointmentActionKey.WaitingForAcceptance, disabled: true };
}

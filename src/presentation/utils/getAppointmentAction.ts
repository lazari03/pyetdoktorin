import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeAppointmentStatus } from '@/presentation/utils/appointmentStatus';
import { isAppointmentAccepted, canPatientPay } from '@/domain/rules/appointmentRules';

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role: UserRole | undefined
): { label: string; disabled: boolean } {
  if (isAppointmentPast(appointment)) {
    return { label: 'past', disabled: true };
  }
  const paymentStatus = (appointment.paymentStatus || '').toString().toLowerCase();
  const isPaymentProcessing = paymentStatus === 'processing';
  const status = normalizeAppointmentStatus(appointment.status);
  if (role === UserRole.Doctor) {
    if (isAppointmentAccepted(appointment) && appointment.isPaid) {
      return { label: 'joinNow', disabled: false };
    }
    if (isPaymentProcessing) {
      return { label: 'paymentProcessing', disabled: true };
    }
    return { label: 'waitingForPayment', disabled: true };
  }
  // Patient
  if (status === 'rejected' || status === 'canceled') {
    return { label: status, disabled: true };
  }
  if (status !== 'accepted') {
    return { label: 'waitingForAcceptance', disabled: true };
  }
  if (isPaymentProcessing) {
    return { label: 'paymentProcessing', disabled: true };
  }
  if (canPatientPay(appointment)) {
    return { label: 'payNow', disabled: false };
  }
  return { label: 'joinNow', disabled: false };
}

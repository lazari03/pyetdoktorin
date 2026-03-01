// Domain utility for mapping appointment action presentation details
// This function is i18n-agnostic; translation should be handled in the UI layer.
// It returns the type of button, label, and disabled state for the action.

import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import { AppointmentActionKey } from '@/domain/entities/AppointmentAction';

export interface AppointmentActionPresentation {
  type: 'join' | 'pay' | 'processing' | 'disabled' | 'waiting' | 'past' | 'none';
  label: string;
  disabled?: boolean;
}

export function getAppointmentActionPresentation(
  appointment: Appointment,
  role: UserRole,
  action: { label: string; disabled: boolean }
): AppointmentActionPresentation {
  const isPatient = role !== UserRole.Doctor;

  // Past appointments are always disabled regardless of role
  if (action.label === AppointmentActionKey.Past) {
    return { type: 'past', label: AppointmentActionKey.Past, disabled: true };
  }

  if (action.disabled) {
    return isPatient
      ? { type: 'disabled', label: action.label, disabled: true }
      : { type: 'waiting', label: AppointmentActionKey.WaitingForPayment, disabled: true };
  }

  if (action.label === AppointmentActionKey.JoinNow) {
    return { type: 'join', label: AppointmentActionKey.JoinNow, disabled: false };
  }

  if (isPatient && !appointment.isPaid && appointment.paymentStatus === 'processing') {
    return { type: 'pay', label: AppointmentActionKey.PayNow, disabled: false };
  }

  if (isPatient && action.label === AppointmentActionKey.PayNow) {
    return { type: 'pay', label: AppointmentActionKey.PayNow, disabled: false };
  }

  return { type: 'none', label: '', disabled: true };
}

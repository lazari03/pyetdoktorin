// Domain utility for mapping appointment action presentation details
// This function is i18n-agnostic; translation should be handled in the UI layer.
// It returns the type of button, label, and disabled state for the action.

import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';

export interface AppointmentActionPresentation {
  type: 'join' | 'pay' | 'disabled' | 'waiting' | 'past' | 'none';
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
  if (action.label === 'past') {
    return { type: 'past', label: 'past', disabled: true };
  }

  if (action.disabled) {
    return isPatient
      ? { type: 'disabled', label: action.label, disabled: true }
      : { type: 'waiting', label: 'waitingForPayment', disabled: true };
  }

  if (action.label === 'joinNow') {
    return { type: 'join', label: 'joinNow', disabled: false };
  }

  if (isPatient && action.label === 'payNow') {
    return { type: 'pay', label: 'payNow', disabled: false };
  }

  return { type: 'none', label: '', disabled: true };
}

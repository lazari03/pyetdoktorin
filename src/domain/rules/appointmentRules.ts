import { Appointment } from '../entities/Appointment';
import { UserRole } from '../entities/UserRole';
import { AppointmentActionKey } from '../entities/AppointmentAction';

export enum AppointmentActionVariant {
  Finished = 'finished',
  Join = 'join',
  Pay = 'pay',
  None = 'none',
}

const AppointmentActionLabels: Record<AppointmentActionVariant, string> = {
  [AppointmentActionVariant.Finished]: AppointmentActionKey.Completed,
  [AppointmentActionVariant.Join]: AppointmentActionKey.JoinNow,
  [AppointmentActionVariant.Pay]: AppointmentActionKey.PayNow,
  [AppointmentActionVariant.None]: AppointmentActionKey.None,
};

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role?: UserRole,
): { label: string; disabled: boolean; variant: string } {
  if (isAppointmentPast(appointment)) {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Finished],
      disabled: true,
      variant: AppointmentActionVariant.Finished,
    };
  }
  if (role === UserRole.Doctor) {
    if (appointment.isPaid) {
      return {
        label: AppointmentActionLabels[AppointmentActionVariant.Join],
        disabled: false,
        variant: AppointmentActionVariant.Join,
      };
    }
    return {
      label: '',
      disabled: true,
      variant: AppointmentActionVariant.None,
    };
  }
  if (appointment.status === 'pending') {
    return {
      label: AppointmentActionKey.Pending,
      disabled: true,
      variant: AppointmentActionVariant.Pay,
    };
  }
  if (appointment.status === 'rejected') {
    return {
      label: AppointmentActionKey.Declined,
      disabled: true,
      variant: AppointmentActionVariant.None,
    };
  }
  if (!appointment.isPaid && appointment.status === 'accepted') {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Pay],
      disabled: false,
      variant: AppointmentActionVariant.Pay,
    };
  }
  if (appointment.isPaid && appointment.status === 'accepted') {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Join],
      disabled: false,
      variant: AppointmentActionVariant.Join,
    };
  }
  return {
    label: '',
    disabled: true,
    variant: AppointmentActionVariant.None,
  };
}

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

import { Appointment } from "../models/Appointment";

enum AppointmentActionVariant {
  Finished = "finished",
  Join = "join",
  Pay = "pay",
  None = "none"
}

const AppointmentActionLabels: Record<AppointmentActionVariant, string> = {
  [AppointmentActionVariant.Finished]: "Finished",
  [AppointmentActionVariant.Join]: "Join Now",
  [AppointmentActionVariant.Pay]: "Pay Now",
  [AppointmentActionVariant.None]: ""
};

export function getAppointmentAction(
  appointment: Appointment,
  isAppointmentPast: (appointment: Appointment) => boolean,
  role?: string // Add role as an optional argument
): { label: string; disabled: boolean; variant: string } {
  // If appointment is in the past, always show "Finished" (disabled)
  if (isAppointmentPast(appointment)) {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Finished],
      disabled: true,
      variant: AppointmentActionVariant.Finished
    };
  }

  // Doctor: Only show Join Now if upcoming and accepted
  if (role === 'doctor') {
    if (appointment.status === 'accepted') {
      return {
        label: AppointmentActionLabels[AppointmentActionVariant.Join],
        disabled: false,
        variant: AppointmentActionVariant.Join
      };
    }
    // Otherwise, no action for doctor
    return {
      label: '',
      disabled: true,
      variant: AppointmentActionVariant.None
    };
  }

  // If status is pending and not in the past, always show disabled "Pending" button (never clickable)
  if (appointment.status === "pending") {
    return {
      label: "Pending",
      disabled: true,
      variant: AppointmentActionVariant.Pay // Use Pay for styling if needed, but always disabled
    };
  }

  // If status is rejected, show disabled button (could say "Declined" or nothing)
  if (appointment.status === "rejected") {
    return {
      label: "Declined",
      disabled: true,
      variant: AppointmentActionVariant.None
    };
  }

  // Show "Pay Now" only if not paid and status is accepted and role is not doctor
  if (!appointment.isPaid && appointment.status === "accepted" && role !== 'doctor') {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Pay],
      disabled: false,
      variant: AppointmentActionVariant.Pay
    };
  }

  // Show "Join Now" only if paid and status is accepted
  if (appointment.isPaid && appointment.status === "accepted") {
    return {
      label: AppointmentActionLabels[AppointmentActionVariant.Join],
      disabled: false,
      variant: AppointmentActionVariant.Join
    };
  }

  // Default: no action
  return {
    label: "",
    disabled: true,
    variant: AppointmentActionVariant.None
  };
}

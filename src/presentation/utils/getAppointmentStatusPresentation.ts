// Domain utility for mapping appointment status to presentation details (label, color)
// This function is i18n-agnostic; translation should be handled in the UI layer.

export interface AppointmentStatusPresentation {
  label: string;
  color: string;
}

export function getAppointmentStatusPresentation(status: string): AppointmentStatusPresentation {
  switch (status) {
    case 'accepted':
      return { color: 'text-emerald-500', label: 'accepted' };
    case 'rejected':
      return { color: 'text-red-500', label: 'declined' };
    case 'pending':
      return { color: 'text-gray-500', label: 'pending' };
    default:
      return { color: 'text-amber-500', label: status };
  }
}

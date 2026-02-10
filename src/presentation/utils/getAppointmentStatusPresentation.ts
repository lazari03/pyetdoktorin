// Domain utility for mapping appointment status to presentation details (label, color)
// This function is i18n-agnostic; translation should be handled in the UI layer.

export interface AppointmentStatusPresentation {
  label: string;
  color: string;
}

export function getAppointmentStatusPresentation(status: string): AppointmentStatusPresentation {
  const normalized = (status || "").toString().trim().toLowerCase();
  switch (normalized) {
    case 'accepted':
      return { color: 'text-emerald-500', label: 'accepted' };
    case 'rejected':
    case 'declined':
      return { color: 'text-red-500', label: 'rejected' };
    case 'canceled':
    case 'cancelled':
      return { color: 'text-rose-500', label: 'canceled' };
    case 'completed':
    case 'finished':
      return { color: 'text-indigo-500', label: 'completed' };
    case 'pending':
      return { color: 'text-gray-500', label: 'pending' };
    default:
      return { color: 'text-amber-500', label: status };
  }
}

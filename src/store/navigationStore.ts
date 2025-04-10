import { HomeIcon, ClipboardIcon, UserIcon, CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';

export function getNavigationPaths(role: string) {
  switch (role) {
    case 'doctor':
      return [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Appointments', href: '/dashboard/appointments' },
        { name: 'Profile', href: '/dashboard/myprofile' },
        { name: 'Calendar', href: '/dashboard/doctor/calendar' },
      ];
    case 'patient':
      return [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'New Appointment', href: '/dashboard/new-appointment' },
        { name: 'Appointment History', href: '/dashboard/appointments' },
        { name: 'Profile', href: '/dashboard/myprofile' },
      ];
    default:
      return [];
  }
}

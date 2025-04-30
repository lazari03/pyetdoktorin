import { UserRole } from '../models/UserRole';

export function getNavigationPaths(role: UserRole) {
  switch (role) {
    case UserRole.Doctor:
      return [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Appointments', href: '/dashboard/appointments' },
        { name: 'Profile', href: '/dashboard/myprofile' },
        { name: 'Calendar', href: '/dashboard/doctor/calendar' },
      ];
    case UserRole.Patient:
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

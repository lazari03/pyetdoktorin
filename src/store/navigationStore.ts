import { UserRole } from '@/domain/entities/UserRole';

// Stable enum keys so we don't rely on display strings for logic
export enum NavigationKey {
  Dashboard = 'dashboard',
  Appointments = 'appointments',
  AppointmentHistory = 'appointmentHistory',
  Profile = 'profile',
  Calendar = 'calendar',
  NewAppointment = 'newAppointment',
  Reciepe = 'reciepe',
  MyReciepes = 'myReciepes',
  Clinics = 'clinics',
}

export interface NavigationItem {
  key: NavigationKey;
  name: string; // display label (can be localized later)
  href: string;
}

export function getNavigationPaths(role: UserRole): NavigationItem[] {
  switch (role) {
    case UserRole.Doctor:
      return [
        { key: NavigationKey.Dashboard, name: 'Dashboard', href: '/dashboard' },
        { key: NavigationKey.Appointments, name: 'Appointments', href: '/dashboard/appointments/journey' },
        { key: NavigationKey.Calendar, name: 'Calendar', href: '/dashboard/doctor/calendar' },
        { key: NavigationKey.Reciepe, name: 'Reciepe', href: '/dashboard/reciepe' },
      ];
    case UserRole.Patient:
      return [
        { key: NavigationKey.Dashboard, name: 'Dashboard', href: '/dashboard' },
        { key: NavigationKey.NewAppointment, name: 'New Appointment', href: '/dashboard/new-appointment' },
        { key: NavigationKey.AppointmentHistory, name: 'Appointment History', href: '/dashboard/appointments/journey' },
        { key: NavigationKey.MyReciepes, name: 'My Reciepes', href: '/dashboard/reciepes' },
        { key: NavigationKey.Clinics, name: 'Private Clinics', href: '/dashboard/clinics' },
      ];
    default:
      return [];
  }
}

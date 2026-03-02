import { ROUTES } from "@/config/routes";

export const DASHBOARD_PATHS = {
  root: ROUTES.DASHBOARD,
  profile: `${ROUTES.DASHBOARD}/myprofile`,
  notifications: `${ROUTES.DASHBOARD}/notifications`,
  earnings: `${ROUTES.DASHBOARD}/earnings`,
  newAppointment: `${ROUTES.DASHBOARD}/new-appointment`,
  appointments: `${ROUTES.DASHBOARD}/appointments`,
  appointmentsJourney: `${ROUTES.DASHBOARD}/appointments/journey`,
  appointmentsVideoSession: `${ROUTES.DASHBOARD}/appointments/video-session`,
  clinics: `${ROUTES.DASHBOARD}/clinics`,
  clinicsHistory: `${ROUTES.DASHBOARD}/clinics/history`,
  doctorCalendar: `${ROUTES.DASHBOARD}/doctor/calendar`,
  doctorProfileBase: `${ROUTES.DASHBOARD}/doctor`,
  reciepe: `${ROUTES.DASHBOARD}/reciepe`,
  reciepes: `${ROUTES.DASHBOARD}/reciepes`,
} as const;

export const ADMIN_PATHS = {
  root: ROUTES.ADMIN,
  users: `${ROUTES.ADMIN}/users`,
  notifications: `${ROUTES.ADMIN}/notifications`,
  reports: `${ROUTES.ADMIN}/reports`,
  profile: `${ROUTES.ADMIN}/profile`,
} as const;

export function dashboardDoctorProfilePath(doctorId: string) {
  return `${DASHBOARD_PATHS.doctorProfileBase}/${doctorId}`;
}

export function dashboardVideoSessionUrl(sessionToken: string) {
  return `${DASHBOARD_PATHS.appointmentsVideoSession}?session=${encodeURIComponent(sessionToken)}`;
}

export function adminReportDetailPath(appointmentId: string) {
  return `${ADMIN_PATHS.reports}/${appointmentId}`;
}

export const CLINIC_PATHS = {
  root: ROUTES.CLINIC,
  calendar: `${ROUTES.CLINIC}/calendar`,
  bookings: `${ROUTES.CLINIC}/bookings`,
  notifications: `${ROUTES.CLINIC}/notifications`,
  earnings: `${ROUTES.CLINIC}/earnings`,
  profile: `${ROUTES.CLINIC}/profile`,
} as const;

export const PHARMACY_PATHS = {
  root: ROUTES.PHARMACY,
  reciepes: `${ROUTES.PHARMACY}/reciepes`,
  notifications: `${ROUTES.PHARMACY}/notifications`,
  profile: `${ROUTES.PHARMACY}/profile`,
} as const;

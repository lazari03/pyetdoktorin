import { ROUTES } from "@/config/routes";
import { UserRole } from "@/domain/entities/UserRole";

export type NavItemDef = {
  key: string;
  href: string;
  labelKey: string;
  fallback: string;
};

export function getDashboardNavDefs(role: UserRole): NavItemDef[] {
  switch (role) {
    case UserRole.Doctor:
      return [
        { key: "dashboard", href: ROUTES.DASHBOARD, labelKey: "dashboard", fallback: "Dashboard" },
        {
          key: "appointments",
          href: `${ROUTES.DASHBOARD}/appointments/journey`,
          labelKey: "Appointments",
          fallback: "Appointments",
        },
        {
          key: "calendar",
          href: `${ROUTES.DASHBOARD}/doctor/calendar`,
          labelKey: "calendar",
          fallback: "Calendar",
        },
        {
          key: "reciepe",
          href: `${ROUTES.DASHBOARD}/reciepe`,
          labelKey: "reciepeTitleDoctor",
          fallback: "Reciepe",
        },
      ];
    case UserRole.Patient:
      return [
        { key: "dashboard", href: ROUTES.DASHBOARD, labelKey: "dashboard", fallback: "Dashboard" },
        {
          key: "newAppointment",
          href: `${ROUTES.DASHBOARD}/new-appointment`,
          labelKey: "newAppointment",
          fallback: "New Appointment",
        },
        {
          key: "appointmentHistory",
          href: `${ROUTES.DASHBOARD}/appointments/journey`,
          labelKey: "appointmentHistory",
          fallback: "Appointment history",
        },
        {
          key: "myReciepes",
          href: `${ROUTES.DASHBOARD}/reciepes`,
          labelKey: "myReciepesTitle",
          fallback: "My reciepes",
        },
        {
          key: "privateClinics",
          href: `${ROUTES.DASHBOARD}/clinics`,
          labelKey: "privateClinics",
          fallback: "Private clinics",
        },
      ];
    default:
      return [];
  }
}

export function getAdminNavDefs(): NavItemDef[] {
  return [
    { key: "adminDashboard", href: ROUTES.ADMIN, labelKey: "adminDashboard", fallback: "Admin Dashboard" },
    { key: "users", href: `${ROUTES.ADMIN}/users`, labelKey: "users", fallback: "Users" },
    { key: "notifications", href: `${ROUTES.ADMIN}/notifications`, labelKey: "notifications", fallback: "Notifications" },
    { key: "reports", href: `${ROUTES.ADMIN}/reports`, labelKey: "reports", fallback: "Reports" },
  ];
}

export function getClinicNavDefs(): NavItemDef[] {
  return [
    { key: "clinicDashboard", href: ROUTES.CLINIC, labelKey: "clinicDashboard", fallback: "Clinic dashboard" },
    { key: "calendar", href: `${ROUTES.CLINIC}/calendar`, labelKey: "calendar", fallback: "Calendar" },
    { key: "bookings", href: `${ROUTES.CLINIC}/bookings`, labelKey: "bookingsTitle", fallback: "Bookings" },
    { key: "profile", href: `${ROUTES.CLINIC}/profile`, labelKey: "Profile", fallback: "Profile" },
  ];
}

export function getPharmacyNavDefs(): NavItemDef[] {
  return [
    { key: "pharmacyDashboard", href: ROUTES.PHARMACY, labelKey: "pharmacyDashboard", fallback: "Pharmacy dashboard" },
    { key: "reciepes", href: `${ROUTES.PHARMACY}/reciepes`, labelKey: "pharmacyReciepesTitle", fallback: "Reciepes" },
    { key: "profile", href: `${ROUTES.PHARMACY}/profile`, labelKey: "Profile", fallback: "Profile" },
  ];
}

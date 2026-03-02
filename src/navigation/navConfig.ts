import { UserRole } from "@/domain/entities/UserRole";
import { ADMIN_PATHS, CLINIC_PATHS, DASHBOARD_PATHS, PHARMACY_PATHS } from "@/navigation/paths";

export type NavItemDef = {
  key: string;
  href: string;
  labelKey: string;
  fallback: string;
};

export type MenuEntryDef =
  | { kind: "link"; key: string; href: string; labelKey: string; fallback: string; analyticsId: string; iconKey: string }
  | { kind: "divider"; key: string }
  | { kind: "action"; key: string; actionId: "logout"; labelKey: string; fallback: string; analyticsId: string; iconKey: string };

export function getDashboardNavDefs(role: UserRole): NavItemDef[] {
  switch (role) {
    case UserRole.Doctor:
      return [
        { key: "dashboard", href: DASHBOARD_PATHS.root, labelKey: "dashboard", fallback: "Dashboard" },
        {
          key: "appointments",
          href: DASHBOARD_PATHS.appointmentsJourney,
          labelKey: "Appointments",
          fallback: "Appointments",
        },
        {
          key: "calendar",
          href: DASHBOARD_PATHS.doctorCalendar,
          labelKey: "calendar",
          fallback: "Calendar",
        },
        {
          key: "reciepe",
          href: DASHBOARD_PATHS.reciepe,
          labelKey: "reciepeTitleDoctor",
          fallback: "Reciepe",
        },
      ];
    case UserRole.Patient:
      return [
        { key: "dashboard", href: DASHBOARD_PATHS.root, labelKey: "dashboard", fallback: "Dashboard" },
        {
          key: "newAppointment",
          href: DASHBOARD_PATHS.newAppointment,
          labelKey: "newAppointment",
          fallback: "New Appointment",
        },
        {
          key: "appointmentHistory",
          href: DASHBOARD_PATHS.appointmentsJourney,
          labelKey: "appointmentHistory",
          fallback: "Appointment history",
        },
        {
          key: "myReciepes",
          href: DASHBOARD_PATHS.reciepes,
          labelKey: "myReciepesTitle",
          fallback: "My reciepes",
        },
        {
          key: "privateClinics",
          href: DASHBOARD_PATHS.clinics,
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
    { key: "adminDashboard", href: ADMIN_PATHS.root, labelKey: "adminDashboard", fallback: "Admin Dashboard" },
    { key: "users", href: ADMIN_PATHS.users, labelKey: "users", fallback: "Users" },
    { key: "notifications", href: ADMIN_PATHS.notifications, labelKey: "notifications", fallback: "Notifications" },
    { key: "reports", href: ADMIN_PATHS.reports, labelKey: "reports", fallback: "Reports" },
  ];
}

export function getClinicNavDefs(): NavItemDef[] {
  return [
    { key: "clinicDashboard", href: CLINIC_PATHS.root, labelKey: "clinicDashboard", fallback: "Clinic dashboard" },
    { key: "calendar", href: CLINIC_PATHS.calendar, labelKey: "calendar", fallback: "Calendar" },
    { key: "bookings", href: CLINIC_PATHS.bookings, labelKey: "bookingsTitle", fallback: "Bookings" },
    { key: "profile", href: CLINIC_PATHS.profile, labelKey: "Profile", fallback: "Profile" },
  ];
}

export function getPharmacyNavDefs(): NavItemDef[] {
  return [
    { key: "pharmacyDashboard", href: PHARMACY_PATHS.root, labelKey: "pharmacyDashboard", fallback: "Pharmacy dashboard" },
    { key: "reciepes", href: PHARMACY_PATHS.reciepes, labelKey: "pharmacyReciepesTitle", fallback: "Reciepes" },
    { key: "profile", href: PHARMACY_PATHS.profile, labelKey: "Profile", fallback: "Profile" },
  ];
}

export function getDashboardProfileMenuDefs(role: UserRole): MenuEntryDef[] {
  const base: MenuEntryDef[] = [
    {
      kind: "link",
      key: "settings",
      href: DASHBOARD_PATHS.profile,
      labelKey: "profileSettings",
      fallback: "Profile settings",
      analyticsId: "dashboard.profile.settings",
      iconKey: "profile",
    },
    {
      kind: "link",
      key: "appointments",
      href: DASHBOARD_PATHS.appointments,
      labelKey: "myAppointments",
      fallback: "My appointments",
      analyticsId: "dashboard.profile.appointments",
      iconKey: "appointments",
    },
    {
      kind: "link",
      key: "notifications",
      href: DASHBOARD_PATHS.notifications,
      labelKey: "notifications",
      fallback: "Notifications",
      analyticsId: "dashboard.profile.notifications",
      iconKey: "notifications",
    },
  ];

  if (role === UserRole.Doctor) {
    base.push({
      kind: "link",
      key: "earnings",
      href: DASHBOARD_PATHS.earnings,
      labelKey: "earnings",
      fallback: "Earnings",
      analyticsId: "dashboard.profile.earnings",
      iconKey: "earnings",
    });
  }

  base.push(
    { kind: "divider", key: "divider" },
    {
      kind: "action",
      key: "logout",
      actionId: "logout",
      labelKey: "logOut",
      fallback: "Log out",
      analyticsId: "dashboard.profile.logout",
      iconKey: "logout",
    },
  );

  return base;
}

export function getAdminProfileMenuDefs(): MenuEntryDef[] {
  return [
    {
      kind: "link",
      key: "settings",
      href: ADMIN_PATHS.profile,
      labelKey: "profileSettings",
      fallback: "Profile settings",
      analyticsId: "admin.profile.settings",
      iconKey: "profile",
    },
    {
      kind: "link",
      key: "dashboard",
      href: ADMIN_PATHS.root,
      labelKey: "adminDashboard",
      fallback: "Admin Dashboard",
      analyticsId: "admin.profile.dashboard",
      iconKey: "dashboard",
    },
    {
      kind: "link",
      key: "notifications",
      href: ADMIN_PATHS.notifications,
      labelKey: "notifications",
      fallback: "Notifications",
      analyticsId: "admin.profile.notifications",
      iconKey: "notifications",
    },
    { kind: "divider", key: "divider" },
    {
      kind: "action",
      key: "logout",
      actionId: "logout",
      labelKey: "logOut",
      fallback: "Log out",
      analyticsId: "admin.profile.logout",
      iconKey: "logout",
    },
  ];
}

export function getClinicProfileMenuDefs(): MenuEntryDef[] {
  return [
    {
      kind: "link",
      key: "settings",
      href: CLINIC_PATHS.profile,
      labelKey: "profileSettings",
      fallback: "Profile settings",
      analyticsId: "clinic.profile.settings",
      iconKey: "profile",
    },
    {
      kind: "link",
      key: "dashboard",
      href: CLINIC_PATHS.root,
      labelKey: "clinicDashboard",
      fallback: "Clinic dashboard",
      analyticsId: "clinic.profile.dashboard",
      iconKey: "dashboard",
    },
    {
      kind: "link",
      key: "calendar",
      href: CLINIC_PATHS.calendar,
      labelKey: "calendar",
      fallback: "Calendar",
      analyticsId: "clinic.profile.calendar",
      iconKey: "calendar",
    },
    {
      kind: "link",
      key: "bookings",
      href: CLINIC_PATHS.bookings,
      labelKey: "bookingsTitle",
      fallback: "Bookings",
      analyticsId: "clinic.profile.bookings",
      iconKey: "bookings",
    },
    {
      kind: "link",
      key: "notifications",
      href: CLINIC_PATHS.notifications,
      labelKey: "notifications",
      fallback: "Notifications",
      analyticsId: "clinic.profile.notifications",
      iconKey: "notifications",
    },
    {
      kind: "link",
      key: "earnings",
      href: CLINIC_PATHS.earnings,
      labelKey: "earnings",
      fallback: "Earnings",
      analyticsId: "clinic.profile.earnings",
      iconKey: "earnings",
    },
    { kind: "divider", key: "divider" },
    {
      kind: "action",
      key: "logout",
      actionId: "logout",
      labelKey: "logOut",
      fallback: "Log out",
      analyticsId: "clinic.profile.logout",
      iconKey: "logout",
    },
  ];
}

export function getPharmacyProfileMenuDefs(): MenuEntryDef[] {
  return [
    {
      kind: "link",
      key: "settings",
      href: PHARMACY_PATHS.profile,
      labelKey: "profileSettings",
      fallback: "Profile settings",
      analyticsId: "pharmacy.profile.settings",
      iconKey: "profile",
    },
    {
      kind: "link",
      key: "dashboard",
      href: PHARMACY_PATHS.root,
      labelKey: "pharmacyDashboard",
      fallback: "Pharmacy dashboard",
      analyticsId: "pharmacy.profile.dashboard",
      iconKey: "dashboard",
    },
    {
      kind: "link",
      key: "notifications",
      href: PHARMACY_PATHS.notifications,
      labelKey: "notifications",
      fallback: "Notifications",
      analyticsId: "pharmacy.profile.notifications",
      iconKey: "notifications",
    },
    { kind: "divider", key: "divider" },
    {
      kind: "action",
      key: "logout",
      actionId: "logout",
      labelKey: "logOut",
      fallback: "Log out",
      analyticsId: "pharmacy.profile.logout",
      iconKey: "logout",
    },
  ];
}

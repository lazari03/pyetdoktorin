import { UserRole } from "@/domain/entities/UserRole";
import { ROUTES } from "@/config/routes";

export function getRoleLandingPath(role?: UserRole | null): string {
  switch (role) {
    case UserRole.Admin:
      return ROUTES.ADMIN;
    case UserRole.Pharmacy:
      return ROUTES.PHARMACY;
    case UserRole.Clinic:
      return ROUTES.CLINIC;
    case UserRole.Doctor:
    case UserRole.Patient:
      return ROUTES.DASHBOARD;
    default:
      return ROUTES.DASHBOARD;
  }
}

export function getRoleNotificationsPath(role?: UserRole | null): string {
  switch (role) {
    case UserRole.Admin:
      return `${ROUTES.ADMIN}/notifications`;
    case UserRole.Pharmacy:
      return ROUTES.PHARMACY;
    case UserRole.Clinic:
      return ROUTES.CLINIC;
    case UserRole.Doctor:
    case UserRole.Patient:
    default:
      return `${ROUTES.DASHBOARD}/notifications`;
  }
}

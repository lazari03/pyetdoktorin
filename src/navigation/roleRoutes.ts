import { UserRole } from "@/domain/entities/UserRole";

export function getRoleLandingPath(role?: UserRole | null): string {
  switch (role) {
    case UserRole.Admin:
      return "/admin";
    case UserRole.Pharmacy:
      return "/pharmacy";
    case UserRole.Clinic:
      return "/clinic";
    case UserRole.Doctor:
    case UserRole.Patient:
      return "/dashboard";
    default:
      return "/dashboard";
  }
}

import { Doctor } from '../entities/Doctor';

export function hasSpecialization(doctor: Doctor, specialization?: string): boolean {
  if (!specialization || specialization.trim() === "") {
    return true;
  }
  const normalized = specialization.trim().toLowerCase();
  return doctor.specialization.some((spec) =>
    spec.toLowerCase().includes(normalized)
  );
}

export function isProfileComplete(doctor: Doctor): boolean {
  return Boolean(doctor.name);
}

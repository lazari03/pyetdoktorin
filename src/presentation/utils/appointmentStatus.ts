export type NormalizedAppointmentStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "canceled"
  | "completed"
  | "unknown";

export function normalizeAppointmentStatus(status?: string): NormalizedAppointmentStatus {
  const normalized = (status || "").toString().trim().toLowerCase();
  if (!normalized) return "unknown";
  if (["canceled", "cancelled"].includes(normalized)) return "canceled";
  if (["rejected", "declined"].includes(normalized)) return "rejected";
  if (["completed", "finished"].includes(normalized)) return "completed";
  if (["accepted", "pending"].includes(normalized)) return normalized as NormalizedAppointmentStatus;
  return "unknown";
}

export function isCanceledStatus(status?: string) {
  return normalizeAppointmentStatus(status) === "canceled";
}

export function isRejectedStatus(status?: string) {
  return normalizeAppointmentStatus(status) === "rejected";
}

export function isCompletedStatus(status?: string) {
  return normalizeAppointmentStatus(status) === "completed";
}

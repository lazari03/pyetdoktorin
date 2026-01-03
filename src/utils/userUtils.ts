export function getDefaultPatientName(displayName?: string): string {
  return displayName && displayName.trim() ? displayName : "A patient";
}

export function getDefaultStatus(status?: string): string {
  return status ?? "pending";
}

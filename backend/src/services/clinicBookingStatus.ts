export type ClinicBookingStatus = 'pending' | 'confirmed' | 'declined';

const VALID_STATUSES: ClinicBookingStatus[] = ['pending', 'confirmed', 'declined'];

export function isClinicBookingStatus(value: unknown): value is ClinicBookingStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as ClinicBookingStatus);
}

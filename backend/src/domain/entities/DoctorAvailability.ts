export interface WeeklySlot {
  day: number;
  startTime: string;
  endTime: string;
}

export interface AvailabilityTimeRange {
  startTime: string;
  endTime: string;
}

export interface DateOverride {
  date: string;
  blocked: boolean;
  slots?: AvailabilityTimeRange[];
}

export type AvailabilityPresetId = string;

export interface AvailabilityPresetCopy {
  en: string;
  al: string;
}

export interface AvailabilityPreset {
  id: AvailabilityPresetId;
  label: AvailabilityPresetCopy;
  description: AvailabilityPresetCopy;
  slotDurationMinutes: number;
  bufferMinutes: number;
  weeklySchedule: WeeklySlot[];
  sortOrder?: number;
  isDefault?: boolean;
}

export interface DoctorAvailability {
  doctorId: string;
  weeklySchedule: WeeklySlot[];
  dateOverrides: DateOverride[];
  slotDurationMinutes: number;
  bufferMinutes: number;
  timezone: string;
  presetId: AvailabilityPresetId;
  updatedAt: string;
}

export interface ResolvedTimeSlot {
  time: string;
  booked: boolean;
  past: boolean;
}

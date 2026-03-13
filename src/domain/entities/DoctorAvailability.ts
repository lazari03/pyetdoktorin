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

export type AvailabilityPresetId = "balanced" | "focused" | "extended";

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

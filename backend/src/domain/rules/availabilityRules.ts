import type {
  AvailabilityPresetId,
  AvailabilityTimeRange,
  DateOverride,
  DoctorAvailability,
  ResolvedTimeSlot,
  WeeklySlot,
} from '@/domain/entities/DoctorAvailability';

const DEFAULT_TIMEZONE = 'Europe/Tirane';

type PresetConfig = {
  id: AvailabilityPresetId;
  slotDurationMinutes: number;
  bufferMinutes: number;
  weeklySchedule: WeeklySlot[];
};

const PRESETS: PresetConfig[] = [
  {
    id: 'balanced',
    slotDurationMinutes: 30,
    bufferMinutes: 10,
    weeklySchedule: [1, 2, 3, 4, 5].map((day) => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
    })),
  },
  {
    id: 'focused',
    slotDurationMinutes: 45,
    bufferMinutes: 15,
    weeklySchedule: [1, 3, 5].map((day) => ({
      day,
      startTime: '10:00',
      endTime: '16:00',
    })),
  },
  {
    id: 'extended',
    slotDurationMinutes: 20,
    bufferMinutes: 5,
    weeklySchedule: [1, 2, 3, 4, 5, 6].map((day) => ({
      day,
      startTime: '08:00',
      endTime: '18:00',
    })),
  },
];

function isValidTimeString(value: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function timeToMinutes(value: string): number {
  const [hours = 0, minutes = 0] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function normalizeRange<T extends AvailabilityTimeRange>(range: T): T | null {
  if (!isValidTimeString(range.startTime) || !isValidTimeString(range.endTime)) return null;
  if (timeToMinutes(range.startTime) >= timeToMinutes(range.endTime)) return null;
  return range;
}

function normalizeWeeklySchedule(schedule: WeeklySlot[]): WeeklySlot[] {
  return schedule
    .filter((slot) => Number.isInteger(slot.day) && slot.day >= 0 && slot.day <= 6)
    .map((slot) => normalizeRange(slot))
    .filter((slot): slot is WeeklySlot => Boolean(slot))
    .sort((a, b) => (a.day - b.day) || (timeToMinutes(a.startTime) - timeToMinutes(b.startTime)));
}

function normalizeDateOverrides(overrides: DateOverride[]): DateOverride[] {
  return overrides
    .filter((override) => /^\d{4}-\d{2}-\d{2}$/.test(override.date))
    .map((override) => ({
      date: override.date,
      blocked: Boolean(override.blocked),
      slots: override.blocked
        ? []
        : (override.slots || [])
            .map((slot) => normalizeRange(slot))
            .filter((slot): slot is AvailabilityTimeRange => Boolean(slot)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function createAvailabilityFromPreset(
  doctorId: string,
  presetId: AvailabilityPresetId = 'balanced',
): DoctorAvailability {
  const preset = PRESETS.find((item) => item.id === presetId) ?? PRESETS[0]!;
  return {
    doctorId,
    weeklySchedule: preset.weeklySchedule,
    dateOverrides: [],
    slotDurationMinutes: preset.slotDurationMinutes,
    bufferMinutes: preset.bufferMinutes,
    timezone: DEFAULT_TIMEZONE,
    presetId: preset.id,
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultAvailability(doctorId: string): DoctorAvailability {
  return createAvailabilityFromPreset(doctorId, 'balanced');
}

export function normalizeAvailability(
  availability: DoctorAvailability,
  doctorId = availability.doctorId,
): DoctorAvailability {
  const fallback = createDefaultAvailability(doctorId);
  const presetId = PRESETS.some((item) => item.id === availability.presetId)
    ? availability.presetId
    : fallback.presetId;

  return {
    doctorId,
    weeklySchedule: normalizeWeeklySchedule(availability.weeklySchedule || []),
    dateOverrides: normalizeDateOverrides(availability.dateOverrides || []),
    slotDurationMinutes:
      Number.isFinite(availability.slotDurationMinutes) && availability.slotDurationMinutes >= 15
        ? Math.min(120, Math.round(availability.slotDurationMinutes))
        : fallback.slotDurationMinutes,
    bufferMinutes:
      Number.isFinite(availability.bufferMinutes) && availability.bufferMinutes >= 0
        ? Math.min(60, Math.round(availability.bufferMinutes))
        : fallback.bufferMinutes,
    timezone: availability.timezone || fallback.timezone,
    presetId,
    updatedAt: availability.updatedAt || new Date().toISOString(),
  };
}

export function resolveSlotsForDate(
  availability: DoctorAvailability,
  date: string,
  bookedTimes: string[],
  nowMinutes?: number,
  isToday = false,
): ResolvedTimeSlot[] {
  const override = availability.dateOverrides.find((entry) => entry.date === date);
  if (override?.blocked) return [];

  const dateValue = new Date(`${date}T00:00:00`);
  const day = Number.isNaN(dateValue.getTime()) ? new Date(date).getDay() : dateValue.getDay();
  const ranges = (override?.slots && override.slots.length > 0
    ? override.slots
    : availability.weeklySchedule.filter((slot) => slot.day === day)) as AvailabilityTimeRange[];

  const step = availability.slotDurationMinutes + availability.bufferMinutes;
  const normalizedBooked = new Set(bookedTimes.filter(isValidTimeString));
  const slots: ResolvedTimeSlot[] = [];

  ranges.forEach((range) => {
    const start = timeToMinutes(range.startTime);
    const end = timeToMinutes(range.endTime);
    for (let pointer = start; pointer + availability.slotDurationMinutes <= end; pointer += step) {
      const time = minutesToTime(pointer);
      const past = Boolean(isToday && typeof nowMinutes === 'number' && pointer <= nowMinutes);
      slots.push({
        time,
        booked: normalizedBooked.has(time),
        past,
      });
    }
  });

  return slots;
}

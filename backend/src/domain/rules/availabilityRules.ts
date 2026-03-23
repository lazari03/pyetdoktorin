import type {
  AvailabilityPreset,
  AvailabilityPresetId,
  AvailabilityTimeRange,
  DateOverride,
  DoctorAvailability,
  ResolvedTimeSlot,
  WeeklySlot,
} from '@/domain/entities/DoctorAvailability';

const DEFAULT_TIMEZONE = 'Europe/Tirane';

const DEFAULT_PRESETS: AvailabilityPreset[] = [
  {
    id: 'balanced',
    label: {
      en: 'Balanced week',
      al: 'Javë e balancuar',
    },
    description: {
      en: 'Weekday availability with comfortable buffers between visits.',
      al: 'Disponueshmëri gjatë ditëve të javës me pushime të rehatshme mes vizitave.',
    },
    slotDurationMinutes: 30,
    bufferMinutes: 10,
    sortOrder: 10,
    isDefault: true,
    weeklySchedule: [1, 2, 3, 4, 5].map((day) => ({
      day,
      startTime: '09:00',
      endTime: '17:00',
    })),
  },
  {
    id: 'focused',
    label: {
      en: 'Focused consults',
      al: 'Konsulta të fokusuara',
    },
    description: {
      en: 'Fewer, longer sessions for higher-touch consultations.',
      al: 'Më pak seanca, por më të gjata, për konsultime më të thelluara.',
    },
    slotDurationMinutes: 45,
    bufferMinutes: 15,
    sortOrder: 20,
    weeklySchedule: [1, 3, 5].map((day) => ({
      day,
      startTime: '10:00',
      endTime: '16:00',
    })),
  },
  {
    id: 'extended',
    label: {
      en: 'Extended access',
      al: 'Qasje e zgjeruar',
    },
    description: {
      en: 'Broader hours for doctors who want more open booking coverage.',
      al: 'Orar më i gjerë për mjekët që duan më shumë mbulim të rezervimeve.',
    },
    slotDurationMinutes: 20,
    bufferMinutes: 5,
    sortOrder: 30,
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
    .sort((a, b) => a.day - b.day || timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
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

function getEffectivePresets(
  presets: AvailabilityPreset[] = DEFAULT_PRESETS,
): AvailabilityPreset[] {
  return presets.length > 0 ? presets : DEFAULT_PRESETS;
}

function getDefaultPreset(
  presets: AvailabilityPreset[] = DEFAULT_PRESETS,
): AvailabilityPreset {
  const effectivePresets = getEffectivePresets(presets);
  return effectivePresets.find((item) => item.isDefault) ?? effectivePresets[0]!;
}

export function getDefaultAvailabilityPresets(): AvailabilityPreset[] {
  return DEFAULT_PRESETS;
}

export function createAvailabilityFromPreset(
  doctorId: string,
  presetId?: AvailabilityPresetId,
  presets: AvailabilityPreset[] = DEFAULT_PRESETS,
): DoctorAvailability {
  const effectivePresets = getEffectivePresets(presets);
  const defaultPreset = getDefaultPreset(effectivePresets);
  const preset = effectivePresets.find((item) => item.id === presetId) ?? defaultPreset;

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

export function createDefaultAvailability(
  doctorId: string,
  presets: AvailabilityPreset[] = DEFAULT_PRESETS,
): DoctorAvailability {
  return createAvailabilityFromPreset(doctorId, getDefaultPreset(presets).id, presets);
}

export function normalizeAvailability(
  availability: DoctorAvailability,
  doctorId = availability.doctorId,
  presets: AvailabilityPreset[] = DEFAULT_PRESETS,
): DoctorAvailability {
  const effectivePresets = getEffectivePresets(presets);
  const fallback = createDefaultAvailability(doctorId, effectivePresets);
  const presetId = effectivePresets.some((item) => item.id === availability.presetId)
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

import type { TFunction } from "i18next";
import type {
  AvailabilityPreset,
  AvailabilityPresetCopy,
  WeeklySlot,
} from "@/domain/entities/DoctorAvailability";

const DAY_TRANSLATION_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const DAY_FALLBACK_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const PRESET_COPY: Record<
  string,
  {
    labelKey: string;
    labelFallback: string;
    descriptionKey: string;
    descriptionFallback: string;
  }
> = {
  balanced: {
    labelKey: "availabilityPresetBalancedLabel",
    labelFallback: "Balanced week",
    descriptionKey: "availabilityPresetBalancedDescription",
    descriptionFallback: "Weekday availability with comfortable buffers between visits.",
  },
  focused: {
    labelKey: "availabilityPresetFocusedLabel",
    labelFallback: "Focused consults",
    descriptionKey: "availabilityPresetFocusedDescription",
    descriptionFallback: "Fewer, longer sessions for higher-touch consultations.",
  },
  extended: {
    labelKey: "availabilityPresetExtendedLabel",
    labelFallback: "Extended access",
    descriptionKey: "availabilityPresetExtendedDescription",
    descriptionFallback: "Broader hours for doctors who want more open booking coverage.",
  },
};

function toAvailabilityLocale(locale?: string | null): keyof AvailabilityPresetCopy {
  return locale?.startsWith("en") ? "en" : "al";
}

function readLocalizedCopy(
  copy: AvailabilityPresetCopy,
  locale?: string | null,
): string {
  return copy[toAvailabilityLocale(locale)];
}

export function getAvailabilityDayLabel(day: number, t: TFunction): string {
  const key = DAY_TRANSLATION_KEYS[day];
  const fallback = DAY_FALLBACK_LABELS[day];
  if (!key || !fallback) return "";
  return t(key, { defaultValue: fallback });
}

export function getAvailabilityOpenDaysLabel(
  weeklySchedule: WeeklySlot[],
  t: TFunction,
): string | null {
  const uniqueDays = Array.from(
    new Set(weeklySchedule.map((slot) => slot.day)),
  ).sort((a, b) => a - b);

  if (uniqueDays.length === 0) return null;

  return uniqueDays
    .map((day) => getAvailabilityDayLabel(day, t))
    .filter(Boolean)
    .join(", ");
}

export function getAvailabilityPresetCopy(
  preset: AvailabilityPreset,
  locale: string | null | undefined,
  t: TFunction,
) {
  const copy = PRESET_COPY[preset.id];
  const label = readLocalizedCopy(preset.label, locale).trim();
  const description = readLocalizedCopy(preset.description, locale).trim();

  return {
    label:
      label ||
      (copy
        ? t(copy.labelKey, { defaultValue: copy.labelFallback })
        : preset.id),
    description:
      description ||
      (copy
        ? t(copy.descriptionKey, {
            defaultValue: copy.descriptionFallback,
          })
        : ""),
  };
}

export function toIntlLocale(locale?: string | null): string {
  return locale?.startsWith("en") ? "en-US" : "sq-AL";
}

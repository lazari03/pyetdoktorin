import { z } from 'zod';
import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import type { AvailabilityPreset } from '@/domain/entities/DoctorAvailability';
import { getDefaultAvailabilityPresets } from '@/domain/rules/availabilityRules';

const COLLECTION = 'availabilityPresets';

const localizedCopySchema = z.object({
  en: z.string().min(1),
  al: z.string().min(1),
});

const weeklySlotSchema = z.object({
  day: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

const availabilityPresetSchema = z.object({
  id: z.string().min(1),
  label: localizedCopySchema,
  description: localizedCopySchema,
  slotDurationMinutes: z.number().int().min(15).max(120),
  bufferMinutes: z.number().int().min(0).max(60),
  weeklySchedule: z.array(weeklySlotSchema),
  sortOrder: z.number().int().optional(),
  isDefault: z.boolean().optional(),
});

function sortPresets(presets: AvailabilityPreset[]): AvailabilityPreset[] {
  return [...presets].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder || left.id.localeCompare(right.id);
  });
}

function ensureSingleDefault(presets: AvailabilityPreset[]): AvailabilityPreset[] {
  const sorted = sortPresets(presets);
  if (sorted.length === 0) return getDefaultAvailabilityPresets();

  const defaultPreset = sorted.find((preset) => preset.isDefault) ?? sorted[0]!;
  return sorted.map((preset) => ({
    ...preset,
    isDefault: preset.id === defaultPreset.id,
  }));
}

function sanitizePreset(
  preset: z.infer<typeof availabilityPresetSchema>,
): AvailabilityPreset {
  const sanitized: AvailabilityPreset = {
    id: preset.id,
    label: preset.label,
    description: preset.description,
    slotDurationMinutes: preset.slotDurationMinutes,
    bufferMinutes: preset.bufferMinutes,
    weeklySchedule: preset.weeklySchedule,
  };

  if (typeof preset.sortOrder === 'number') {
    sanitized.sortOrder = preset.sortOrder;
  }

  if (typeof preset.isDefault === 'boolean') {
    sanitized.isDefault = preset.isDefault;
  }

  return sanitized;
}

export async function listAvailabilityPresets(): Promise<AvailabilityPreset[]> {
  try {
    const admin = getFirebaseAdmin();
    const snapshot = await admin.firestore().collection(COLLECTION).get();
    if (snapshot.empty) return getDefaultAvailabilityPresets();

    const presets = snapshot.docs.flatMap((doc) => {
      const parsed = availabilityPresetSchema.safeParse({
        ...doc.data(),
        id: doc.id,
      });
      if (!parsed.success) {
        console.warn('Invalid availability preset config', {
          id: doc.id,
          issues: parsed.error.issues,
        });
        return [];
      }
      return [sanitizePreset(parsed.data)];
    });

    return presets.length > 0
      ? ensureSingleDefault(presets)
      : getDefaultAvailabilityPresets();
  } catch (error) {
    console.error('Failed to load availability presets', error);
    return getDefaultAvailabilityPresets();
  }
}

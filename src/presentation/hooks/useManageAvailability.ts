import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AvailabilityPreset,
  AvailabilityPresetId,
  DateOverride,
  DoctorAvailability,
  WeeklySlot,
} from '@/domain/entities/DoctorAvailability';
import {
  countWeeklyCapacity,
  createAvailabilityFromPreset,
  getDefaultAvailabilityPresets,
  normalizeAvailability,
} from '@/domain/rules/availabilityRules';
import { availabilityService } from '@/infrastructure/services/availabilityServiceAdapter';
import {
  getAvailabilityOpenDaysLabel,
  getAvailabilityPresetCopy,
} from '@/presentation/utils/availabilityPresentation';

type DayPatch = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export function useManageAvailability(doctorId: string | null) {
  const { t, i18n } = useTranslation();
  const [presetDefinitions, setPresetDefinitions] = useState<AvailabilityPreset[]>(
    getDefaultAvailabilityPresets(),
  );
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);
    try {
      const [availabilityResult, presetsResult] = await Promise.all([
        availabilityService.getMyAvailability(),
        availabilityService.getPresets(),
      ]);
      const effectivePresets = presetsResult.length > 0
        ? presetsResult
        : getDefaultAvailabilityPresets();
      setPresetDefinitions(effectivePresets);
      setAvailability(
        normalizeAvailability(availabilityResult, doctorId, effectivePresets),
      );
      setSavedAt(availabilityResult.updatedAt || null);
    } catch (err) {
      const fallbackPresets = getDefaultAvailabilityPresets();
      const fallback = createAvailabilityFromPreset(
        doctorId,
        undefined,
        fallbackPresets,
      );
      setPresetDefinitions(fallbackPresets);
      setAvailability(fallback);
      setSavedAt(fallback.updatedAt || null);
      setError(
        err instanceof Error
          ? err.message
          : t('availabilityLoadError', {
              defaultValue: 'Failed to load availability.',
            }),
      );
    } finally {
      setLoading(false);
    }
  }, [doctorId, i18n.resolvedLanguage, t]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyPreset = useCallback((presetId: AvailabilityPresetId) => {
    if (!doctorId) return;
    setAvailability((prev) => {
      const next = createAvailabilityFromPreset(
        doctorId,
        presetId,
        presetDefinitions,
      );
      if (!prev) return next;
      return {
        ...next,
        dateOverrides: prev.dateOverrides,
      };
    });
  }, [doctorId, presetDefinitions]);

  const updateWeeklyDay = useCallback((day: number, patch: DayPatch) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const withoutDay = prev.weeklySchedule.filter((slot) => slot.day !== day);
      const nextWeekly = patch.enabled
        ? [
            ...withoutDay,
            { day, startTime: patch.startTime, endTime: patch.endTime } as WeeklySlot,
          ]
        : withoutDay;
      return normalizeAvailability(
        { ...prev, weeklySchedule: nextWeekly },
        prev.doctorId,
        presetDefinitions,
      );
    });
  }, [presetDefinitions]);

  const setSlotDurationMinutes = useCallback((value: number) => {
    setAvailability((prev) =>
      prev
        ? normalizeAvailability(
            { ...prev, slotDurationMinutes: value },
            prev.doctorId,
            presetDefinitions,
          )
        : prev,
    );
  }, [presetDefinitions]);

  const setBufferMinutes = useCallback((value: number) => {
    setAvailability((prev) =>
      prev
        ? normalizeAvailability(
            { ...prev, bufferMinutes: value },
            prev.doctorId,
            presetDefinitions,
          )
        : prev,
    );
  }, [presetDefinitions]);

  const addOverride = useCallback(() => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const baseDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const suffix = prev.dateOverrides.length;
      const date =
        suffix === 0
          ? baseDate
          : new Date(Date.now() + (suffix + 1) * 24 * 60 * 60 * 1000)
              .toISOString()
              .slice(0, 10);
      const override: DateOverride = {
        date,
        blocked: false,
        slots: [{ startTime: '09:00', endTime: '12:00' }],
      };
      return normalizeAvailability(
        { ...prev, dateOverrides: [...prev.dateOverrides, override] },
        prev.doctorId,
        presetDefinitions,
      );
    });
  }, [presetDefinitions]);

  const updateOverride = useCallback((index: number, next: DateOverride) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const dateOverrides = prev.dateOverrides.map((entry, entryIndex) =>
        entryIndex === index ? next : entry,
      );
      return normalizeAvailability(
        { ...prev, dateOverrides },
        prev.doctorId,
        presetDefinitions,
      );
    });
  }, [presetDefinitions]);

  const removeOverride = useCallback((index: number) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const dateOverrides = prev.dateOverrides.filter(
        (_, entryIndex) => entryIndex !== index,
      );
      return normalizeAvailability(
        { ...prev, dateOverrides },
        prev.doctorId,
        presetDefinitions,
      );
    });
  }, [presetDefinitions]);

  const save = useCallback(async () => {
    if (!availability) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await availabilityService.saveMyAvailability({
        weeklySchedule: availability.weeklySchedule,
        dateOverrides: availability.dateOverrides,
        slotDurationMinutes: availability.slotDurationMinutes,
        bufferMinutes: availability.bufferMinutes,
        timezone: availability.timezone,
        presetId: availability.presetId,
      });
      setAvailability(normalizeAvailability(saved, saved.doctorId, presetDefinitions));
      setSavedAt(saved.updatedAt);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('availabilitySaveError', {
              defaultValue: 'Failed to save availability.',
            }),
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }, [availability, i18n.resolvedLanguage, presetDefinitions, t]);

  const presets = useMemo(
    () =>
      presetDefinitions.map((preset) => ({
        ...preset,
        ...getAvailabilityPresetCopy(preset, i18n.resolvedLanguage, t),
      })),
    [i18n.resolvedLanguage, presetDefinitions, t],
  );

  const summary = useMemo(() => {
    if (!availability) return { weeklyCapacity: 0, openDays: null };
    return {
      weeklyCapacity: countWeeklyCapacity(availability),
      openDays: getAvailabilityOpenDaysLabel(availability.weeklySchedule, t),
    };
  }, [availability, i18n.resolvedLanguage, t]);

  return {
    availability,
    loading,
    saving,
    error,
    savedAt,
    presets,
    summary,
    applyPreset,
    updateWeeklyDay,
    setSlotDurationMinutes,
    setBufferMinutes,
    addOverride,
    updateOverride,
    removeOverride,
    save,
    refresh,
  };
}

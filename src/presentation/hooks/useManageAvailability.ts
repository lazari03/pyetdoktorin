import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AvailabilityPresetId,
  DateOverride,
  DoctorAvailability,
  WeeklySlot,
} from '@/domain/entities/DoctorAvailability';
import {
  countWeeklyCapacity,
  createAvailabilityFromPreset,
  findNextOpenDayLabel,
  getAvailabilityPresets,
  normalizeAvailability,
} from '@/domain/rules/availabilityRules';
import { availabilityService } from '@/infrastructure/services/availabilityServiceAdapter';

type DayPatch = {
  enabled: boolean;
  startTime: string;
  endTime: string;
};

export function useManageAvailability(doctorId: string | null) {
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
      const data = await availabilityService.getMyAvailability();
      setAvailability(normalizeAvailability(data, doctorId));
      setSavedAt(data.updatedAt || null);
    } catch (err) {
      const fallback = createAvailabilityFromPreset(doctorId, 'balanced');
      setAvailability(fallback);
      setError(err instanceof Error ? err.message : 'Failed to load availability');
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyPreset = useCallback((presetId: AvailabilityPresetId) => {
    if (!doctorId) return;
    setAvailability((prev) => {
      const next = createAvailabilityFromPreset(doctorId, presetId);
      if (!prev) return next;
      return {
        ...next,
        dateOverrides: prev.dateOverrides,
      };
    });
  }, [doctorId]);

  const updateWeeklyDay = useCallback((day: number, patch: DayPatch) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const withoutDay = prev.weeklySchedule.filter((slot) => slot.day !== day);
      const nextWeekly = patch.enabled
        ? [...withoutDay, { day, startTime: patch.startTime, endTime: patch.endTime } as WeeklySlot]
        : withoutDay;
      return normalizeAvailability({ ...prev, weeklySchedule: nextWeekly }, prev.doctorId);
    });
  }, []);

  const setSlotDurationMinutes = useCallback((value: number) => {
    setAvailability((prev) => prev ? normalizeAvailability({ ...prev, slotDurationMinutes: value }, prev.doctorId) : prev);
  }, []);

  const setBufferMinutes = useCallback((value: number) => {
    setAvailability((prev) => prev ? normalizeAvailability({ ...prev, bufferMinutes: value }, prev.doctorId) : prev);
  }, []);

  const addOverride = useCallback(() => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const baseDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const suffix = prev.dateOverrides.length;
      const date = suffix === 0 ? baseDate : new Date(Date.now() + (suffix + 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const override: DateOverride = {
        date,
        blocked: false,
        slots: [{ startTime: '09:00', endTime: '12:00' }],
      };
      return normalizeAvailability({ ...prev, dateOverrides: [...prev.dateOverrides, override] }, prev.doctorId);
    });
  }, []);

  const updateOverride = useCallback((index: number, next: DateOverride) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const dateOverrides = prev.dateOverrides.map((entry, entryIndex) => (entryIndex === index ? next : entry));
      return normalizeAvailability({ ...prev, dateOverrides }, prev.doctorId);
    });
  }, []);

  const removeOverride = useCallback((index: number) => {
    setAvailability((prev) => {
      if (!prev) return prev;
      const dateOverrides = prev.dateOverrides.filter((_, entryIndex) => entryIndex !== index);
      return normalizeAvailability({ ...prev, dateOverrides }, prev.doctorId);
    });
  }, []);

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
      setAvailability(saved);
      setSavedAt(saved.updatedAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [availability]);

  const summary = useMemo(() => {
    if (!availability) return { weeklyCapacity: 0, openDays: null };
    return {
      weeklyCapacity: countWeeklyCapacity(availability),
      openDays: findNextOpenDayLabel(availability),
    };
  }, [availability]);

  return {
    availability,
    loading,
    saving,
    error,
    savedAt,
    presets: getAvailabilityPresets(),
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

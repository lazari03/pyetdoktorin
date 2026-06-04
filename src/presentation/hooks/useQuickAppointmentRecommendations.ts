'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useDI } from '@/context/DIContext';
import { useNewAppointmentStore } from '@/store/newAppointmentStore';
import type { QuickAppointmentMatch } from '@/domain/entities/QuickAppointment';

const QUICK_SUGGESTION_SIZE = 3;
const SHUFFLE_COOLDOWN = 5;
const MAX_SHUFFLES = 3;

function getNowDefaults() {
  const now = new Date();
  return {
    preferredDate: now.toISOString().slice(0, 10),
    preferredTime: format(now, 'HH:mm'),
  };
}

function formatDisplayDate(date: string, time: string): string {
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} ${time}`.trim();
  }
  return parsed.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeMatch(match: QuickAppointmentMatch): QuickAppointmentMatch {
  return {
    ...match,
    specialties: Array.isArray(match.specialties) ? match.specialties.filter(Boolean) : [],
  };
}

export function useQuickAppointmentRecommendations() {
  const { user, role } = useAuth();
  const { getQuickAppointmentMatchesUseCase } = useDI();
  const setSelectedDoctor = useNewAppointmentStore((state) => state.setSelectedDoctor);
  const setPreferredDate = useNewAppointmentStore((state) => state.setPreferredDate);
  const setPreferredTime = useNewAppointmentStore((state) => state.setPreferredTime);
  const setAppointmentType = useNewAppointmentStore((state) => state.setAppointmentType);

  const defaults = useMemo(getNowDefaults, []);
  const [specialty, setSpecialty] = useState('');
  const [preferredDate, setPreferredDateState] = useState(defaults.preferredDate);
  const [preferredTime, setPreferredTimeState] = useState(defaults.preferredTime);
  const [allMatches, setAllMatches] = useState<QuickAppointmentMatch[]>([]);
  const [items, setItems] = useState<QuickAppointmentMatch[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shuffleIndex, setShuffleIndex] = useState(0);
  const [, setLastSuggestedAtShuffle] = useState<Record<string, number>>({});

  const randomPick = useCallback((source: QuickAppointmentMatch[], count: number): QuickAppointmentMatch[] => {
    const pool = [...source];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, count);
  }, []);

  const pickSuggestions = useCallback((
    source: QuickAppointmentMatch[],
    currentShuffle: number,
    previous: Record<string, number>,
  ): QuickAppointmentMatch[] => {
    if (source.length === 0) return [];

    const canSuggest = (doctorId: string) => {
      const lastSeen = previous[doctorId];
      if (typeof lastSeen !== 'number') return true;
      return currentShuffle - lastSeen >= SHUFFLE_COOLDOWN;
    };

    const cooldownEligible = source.filter((item) => canSuggest(item.doctorId));
    const primaryPool = cooldownEligible.filter((item) => !item.hasPreviousMeetings);
    const secondaryPool = cooldownEligible.filter((item) => item.hasPreviousMeetings);

    const pickedPrimary = randomPick(primaryPool, QUICK_SUGGESTION_SIZE);
    const stillNeeded = QUICK_SUGGESTION_SIZE - pickedPrimary.length;
    const pickedSecondary = stillNeeded > 0
      ? randomPick(secondaryPool.filter((item) => !pickedPrimary.some((entry) => entry.doctorId === item.doctorId)), stillNeeded)
      : [];

    const picked = [...pickedPrimary, ...pickedSecondary];
    if (picked.length >= QUICK_SUGGESTION_SIZE) {
      return picked;
    }

    const fallbackPool = source.filter((item) => !picked.some((entry) => entry.doctorId === item.doctorId));
    return [...picked, ...randomPick(fallbackPool, QUICK_SUGGESTION_SIZE - picked.length)];
  }, [randomPick]);

  const loadMatches = useCallback(async (nextQuery: { specialty?: string; preferredDate?: string; preferredTime?: string }) => {
    if (!user?.uid || role !== 'patient' || !getQuickAppointmentMatchesUseCase) {
      return;
    }

    const query = {
      specialty: nextQuery.specialty ?? '',
      preferredDate: nextQuery.preferredDate ?? defaults.preferredDate,
      preferredTime: nextQuery.preferredTime ?? defaults.preferredTime,
      limit: 50,
    };

    setLoading(true);
    setError(null);
    try {
      const response = await getQuickAppointmentMatchesUseCase.execute(query);
      const normalizedItems = (response.items ?? []).map(normalizeMatch);
      const baseSuggestions = pickSuggestions(normalizedItems, 0, {});
      const initialSuggestedMap = baseSuggestions.reduce<Record<string, number>>((acc, item) => {
        acc[item.doctorId] = 0;
        return acc;
      }, {});

      setAllMatches(normalizedItems);
      setItems(baseSuggestions);
      setSpecialties(response.specialties ?? []);
      setPreferredDateState(response.preferredDate || query.preferredDate || defaults.preferredDate);
      setPreferredTimeState(response.preferredTime || query.preferredTime || defaults.preferredTime);
      setShuffleIndex(0);
      setLastSuggestedAtShuffle(initialSuggestedMap);
    } catch (err) {
      setAllMatches([]);
      setItems([]);
      setError(err instanceof Error ? err.message : 'Failed to load quick matches');
    } finally {
      setLoading(false);
    }
  }, [defaults.preferredDate, defaults.preferredTime, getQuickAppointmentMatchesUseCase, pickSuggestions, role, user?.uid]);

  useEffect(() => {
    void loadMatches({ preferredDate: defaults.preferredDate, preferredTime: defaults.preferredTime, specialty: '' });
  }, [defaults.preferredDate, defaults.preferredTime, loadMatches]);

  const availableCount = useMemo(() => allMatches.filter((item) => item.availableNow).length, [allMatches]);
  const availableNowDoctors = useMemo(() => allMatches.filter((item) => item.availableNow).slice(0, 5), [allMatches]);

  const handleSelectDoctor = useCallback((doctorId: string) => {
    const selected = items.find((item) => item.doctorId === doctorId);
    if (!selected) return;

    setSelectedDoctor({
      id: selected.doctorId,
      name: selected.doctorName,
      specialization: selected.specialties.join(', '),
    });
    setPreferredDate(selected.nextAvailableDate);
    setPreferredTime(selected.nextAvailableTime);
    setAppointmentType('Quick appointment');
  }, [items, setAppointmentType, setPreferredDate, setPreferredTime, setSelectedDoctor]);

  const handleSearch = useCallback(() => {
    void loadMatches({ specialty, preferredDate, preferredTime });
  }, [loadMatches, preferredDate, preferredTime, specialty]);

  const handleShuffle = useCallback(() => {
    if (allMatches.length <= 1) return;
    setShuffleIndex((current) => {
      if (current >= MAX_SHUFFLES) return current;
      const nextShuffle = current + 1;
      if (nextShuffle > MAX_SHUFFLES) return current;
      setLastSuggestedAtShuffle((previous) => {
        const nextSuggestions = pickSuggestions(allMatches, nextShuffle, previous);
        setItems(nextSuggestions);
        const next = { ...previous };
        nextSuggestions.forEach((item) => {
          next[item.doctorId] = nextShuffle;
        });
        return next;
      });
      return nextShuffle;
    });
  }, [allMatches, pickSuggestions]);

  const handleReset = useCallback(() => {
    const next = getNowDefaults();
    setSpecialty('');
    setPreferredDateState(next.preferredDate);
    setPreferredTimeState(next.preferredTime);
    setLastSuggestedAtShuffle({});
    void loadMatches({ specialty: '', preferredDate: next.preferredDate, preferredTime: next.preferredTime });
  }, [loadMatches]);

  const suggestions = useMemo(
    () =>
      items.map((item) => ({
        ...item,
        nextAvailableAt: formatDisplayDate(item.nextAvailableDate, item.nextAvailableTime),
      })),
    [items],
  );

  return {
    loading,
    error,
    specialties,
    selectedSpecialty: specialty,
    preferredDate,
    preferredTime,
    shuffleCount: shuffleIndex,
    canShuffle: shuffleIndex < MAX_SHUFFLES,
    availableCount,
    availableNowDoctors,
    suggestions,
    setSpecialty,
    setPreferredDate: setPreferredDateState,
    setPreferredTime: setPreferredTimeState,
    onSearch: handleSearch,
    onShuffle: handleShuffle,
    onReset: handleReset,
    onSelectDoctor: handleSelectDoctor,
  };
}
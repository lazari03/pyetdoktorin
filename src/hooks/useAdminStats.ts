"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { getTopDoctorsByAppointments, getTopDoctorsByRequests } from '@/domain/appointments';
import type { User } from '@/domain/entities/User';

export type DoctorStat = { doctor: { name: string; id: string }, count: number };

/**
 * Admin stats hook: fetches top doctors by visits and requests with a simple in-memory cache.
 * - Caches raw domain results for 10 minutes on globalThis across component mounts
 * - Fetches concurrently and only refreshes stale datasets
 */
type CacheEntry = { data: Array<{ doctor: { name: string; id: string }; count: number }>; ts: number };
type CacheShape = { visits?: CacheEntry; requests?: CacheEntry };

export function useAdminStats(limit = 5) {
  const [visits, setVisits] = useState<DoctorStat[]>([]);
  const [requests, setRequests] = useState<DoctorStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
  const cache = useMemo<CacheShape>(() => {
    const g = globalThis as unknown as { __pkAdminStatsCache?: CacheShape };
    if (!g.__pkAdminStatsCache) g.__pkAdminStatsCache = {};
    return g.__pkAdminStatsCache;
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    const controller = new AbortController();
    const { signal } = controller;

    (async () => {
      setLoading(true); setError(null);
      try {
        const now = Date.now();
        const needsVisits = !(cache.visits && (now - cache.visits.ts) < CACHE_TTL_MS);
        const needsRequests = !(cache.requests && (now - cache.requests.ts) < CACHE_TTL_MS);

        const [v, r] = await Promise.all([
          needsVisits ? getTopDoctorsByAppointments(limit) : Promise.resolve(cache.visits?.data ?? []),
          needsRequests ? getTopDoctorsByRequests(limit) : Promise.resolve(cache.requests?.data ?? []),
        ]);
        if (signal.aborted) return;

        const visitsData: DoctorStat[] = (v as Array<{ doctor: User; count: number }>).map((x) => ({ doctor: { name: x.doctor.email, id: x.doctor.id }, count: x.count }));
        const requestsData: DoctorStat[] = (r as Array<{ doctor: User; count: number }>).map((x) => ({ doctor: { name: x.doctor.email, id: x.doctor.id }, count: x.count }));
        setVisits(visitsData);
        setRequests(requestsData);

        if (needsVisits) cache.visits = { data: visitsData, ts: now };
        if (needsRequests) cache.requests = { data: requestsData, ts: now };
      } catch (e) {
        if (signal.aborted) return;
        setError(e instanceof Error ? e.message : 'unknown');
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [limit, cache, CACHE_TTL_MS]);

  return { visits, requests, loading, error };
}

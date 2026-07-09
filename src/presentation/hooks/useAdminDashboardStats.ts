"use client";

import { useCallback, useEffect, useState } from 'react';
import { useDI } from '@/context/DIContext';
import type { AdminDashboardStats } from '@/application/ports/IAdminStatsService';

export function useAdminDashboardStats() {
  const { getAdminDashboardStatsUseCase } = useDI();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminDashboardStatsUseCase.execute();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
    } finally {
      setLoading(false);
    }
  }, [getAdminDashboardStatsUseCase]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: fetchStats,
  };
}

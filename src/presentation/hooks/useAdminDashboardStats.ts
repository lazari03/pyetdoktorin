"use client";

import { useCallback, useEffect, useState } from 'react';
import { fetchAdminDashboardStats } from '@/network/adminStats';

interface AdminDashboardStats {
  totalAppointments: number;
  totalRecipes: number;
  totalClinicBookings: number;
  totalUsers: number;
  monthlyRevenue: number;
}

export function useAdminDashboardStats() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load stats'));
    } finally {
      setLoading(false);
    }
  }, []);

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

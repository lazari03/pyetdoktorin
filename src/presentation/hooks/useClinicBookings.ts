import { useCallback, useEffect, useState } from 'react';
import { ClinicBooking, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { backendFetch } from '@/network/backendClient';

interface Options {
  clinicId?: string;
  patientId?: string;
}

export function useClinicBookings({ clinicId, patientId }: Options) {
  const [bookings, setBookings] = useState<ClinicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (clinicId) params.set('clinicId', clinicId);
      if (patientId) params.set('patientId', patientId);
      const query = params.toString() ? `?${params.toString()}` : '';
      const response = await backendFetch<{ items: ClinicBooking[] }>(`/api/clinics/bookings${query}`);
      setBookings(response.items);
    } catch (err) {
      console.error(err);
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [clinicId, patientId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = useCallback(
    async (bookingId: string, status: ClinicBookingStatus) => {
      await backendFetch(`/api/clinics/bookings/${bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
    },
    [],
  );

  return { bookings, loading, error, refresh: fetchBookings, updateStatus };
}

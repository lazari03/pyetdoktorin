import { useCallback, useEffect, useState } from 'react';
import { ClinicBooking, ClinicBookingStatus } from '@/domain/entities/ClinicBooking';
import { useDI } from '@/context/DIContext';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

interface Options {
  clinicId?: string;
  patientId?: string;
}

export function useClinicBookings({ clinicId, patientId }: Options) {
  const { getClinicBookingsUseCase, updateClinicBookingStatusUseCase } = useDI();
  const [bookings, setBookings] = useState<ClinicBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await getClinicBookingsUseCase.execute({ clinicId, patientId });
      setBookings(items);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [clinicId, getClinicBookingsUseCase, patientId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = useCallback(
    async (bookingId: string, status: ClinicBookingStatus) => {
      try {
        await updateClinicBookingStatusUseCase.execute(bookingId, status);
        setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
        trackAnalyticsEvent('clinic_booking_status_updated', { bookingId, status });
      } catch (error) {
        trackAnalyticsEvent('clinic_booking_status_failed', {
          bookingId,
          status,
          reason: error instanceof Error ? error.message.slice(0, 120) : 'unknown_error',
        });
        throw error;
      }
    },
    [updateClinicBookingStatusUseCase],
  );

  return { bookings, loading, error, refresh: fetchBookings, updateStatus };
}

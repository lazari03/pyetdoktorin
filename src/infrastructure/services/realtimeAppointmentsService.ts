import { IRealtimeAppointmentsService } from '@/application/ports/IRealtimeAppointmentsService';
import { listAppointments } from '@/network/appointments';

type PendingAppointment = Record<string, unknown>;

export class RealtimeAppointmentsService implements IRealtimeAppointmentsService {
  subscribeToPendingAppointments(_doctorId: string, onChange: (count: number) => void): () => void {
    return this.subscribe((_items) => {
      onChange(_items.length);
    });
  }

  subscribeToPendingAppointmentNotifications<T>(
    _doctorId: string,
    map: (data: Record<string, unknown>) => T,
    onChange: (items: T[]) => void
  ): () => void {
    return this.subscribe((items) => {
      onChange(items.map((item) => map(item)));
    });
  }

  private subscribe(onChange: (items: PendingAppointment[]) => void): () => void {
    let disposed = false;

    const refresh = async () => {
      try {
        const response = await listAppointments();
        if (disposed) return;
        const pending = response.items.filter(
          (item) => String(item.status ?? '').toLowerCase() === 'pending',
        ).map((item) => ({ ...item })) as PendingAppointment[];
        onChange(pending);
      } catch (error) {
        if (disposed) return;
        console.warn('Pending appointments refresh failed', error);
      }
    };

    void refresh();
    const intervalId = setInterval(() => {
      void refresh();
    }, 30_000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    const handleFocus = () => {
      void refresh();
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus);
    }

    return () => {
      disposed = true;
      clearInterval(intervalId);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('focus', handleFocus);
      }
    };
  }
}

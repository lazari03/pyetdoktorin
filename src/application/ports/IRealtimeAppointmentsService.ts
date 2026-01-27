export interface IRealtimeAppointmentsService {
  subscribeToPendingAppointments(doctorId: string, onChange: (count: number) => void): () => void;
  subscribeToPendingAppointmentNotifications<T>(
    doctorId: string,
    map: (data: Record<string, unknown>) => T,
    onChange: (items: T[]) => void
  ): () => void;
}

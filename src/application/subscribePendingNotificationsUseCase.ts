import { IRealtimeAppointmentsService } from '@/application/ports/IRealtimeAppointmentsService';

export class SubscribePendingNotificationsUseCase {
  constructor(private realtimeAppointmentsService: IRealtimeAppointmentsService) {}

  execute<T>(doctorId: string, map: (data: Record<string, unknown>) => T, onChange: (items: T[]) => void): () => void {
    return this.realtimeAppointmentsService.subscribeToPendingAppointmentNotifications(doctorId, map, onChange);
  }
}

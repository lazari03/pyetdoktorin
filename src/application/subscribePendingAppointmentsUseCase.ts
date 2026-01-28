import { IRealtimeAppointmentsService } from '@/application/ports/IRealtimeAppointmentsService';

export class SubscribePendingAppointmentsUseCase {
  constructor(private realtimeAppointmentsService: IRealtimeAppointmentsService) {}

  execute(doctorId: string, onChange: (count: number) => void): () => void {
    return this.realtimeAppointmentsService.subscribeToPendingAppointments(doctorId, onChange);
  }
}

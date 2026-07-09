import type { IAppointmentService } from './ports/IAppointmentService';
import type { Appointment } from '@/domain/entities/Appointment';

export class ListAppointmentsUseCase {
  constructor(private service: IAppointmentService) {}
  async execute(): Promise<Appointment[]> {
    return this.service.listAppointments();
  }
}

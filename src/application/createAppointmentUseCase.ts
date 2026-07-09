import type { IAppointmentService, CreateAppointmentInput } from './ports/IAppointmentService';
import type { Appointment } from '@/domain/entities/Appointment';

export class CreateAppointmentUseCase {
  constructor(private service: IAppointmentService) {}
  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    return this.service.createAppointment(input);
  }
}

import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import { Appointment } from '@/domain/entities/Appointment';

export class UpdateAppointmentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    return this.appointmentRepo.update(id, updates);
  }
}

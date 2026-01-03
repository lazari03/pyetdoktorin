import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';
import { Appointment } from '@/domain/entities/Appointment';

export class FetchAppointmentsUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    return this.appointmentRepo.getByUser(userId, isDoctor);
  }
}

import { Appointment } from '../domain/entities/Appointment';
import { IAppointmentRepository } from '../domain/repositories/IAppointmentRepository';
import { isValidAppointment } from '../domain/rules/appointmentRules';

export class CreateAppointmentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(appointment: Appointment): Promise<Appointment> {
    if (!isValidAppointment(appointment)) {
      throw new Error('Invalid appointment data');
    }
    return await this.appointmentRepo.create(appointment);
  }
}

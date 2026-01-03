import { Appointment } from '../domain/entities/Appointment';
import { IAppointmentRepository } from '../domain/repositories/IAppointmentRepository';
import { isAppointmentPaid } from '../domain/rules/appointmentRules';

export class ProcessPaymentUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepo.getById(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    if (isAppointmentPaid(appointment)) {
      throw new Error('Appointment already paid');
    }
    return await this.appointmentRepo.markAsPaid(appointmentId);
  }
}

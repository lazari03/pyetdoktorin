import { Appointment } from '@/domain/entities/Appointment';
import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class GetAppointmentsUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    return this.appointmentService.getAppointments(userId, isDoctor);
  }
}

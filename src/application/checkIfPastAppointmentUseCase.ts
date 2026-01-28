import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class CheckIfPastAppointmentUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(appointmentId: string): Promise<boolean> {
    return this.appointmentService.checkIfPastAppointment(appointmentId);
  }
}

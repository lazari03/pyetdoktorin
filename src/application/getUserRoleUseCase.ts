import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class GetUserRoleUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(userId: string): Promise<string> {
    return this.appointmentService.getUserRole(userId);
  }
}

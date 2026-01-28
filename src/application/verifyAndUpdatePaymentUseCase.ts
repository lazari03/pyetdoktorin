import { IAppointmentService } from '@/application/ports/IAppointmentService';

export class VerifyAndUpdatePaymentUseCase {
  constructor(private appointmentService: IAppointmentService) {}

  async execute(
    sessionId: string,
    userId: string,
    isDoctor: boolean,
    onRefresh: (userId: string, isDoctor: boolean) => Promise<void>
  ): Promise<void> {
    await this.appointmentService.verifyAndUpdatePayment(sessionId, userId, isDoctor, onRefresh);
  }
}

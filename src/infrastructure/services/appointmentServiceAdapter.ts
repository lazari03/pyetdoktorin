import { IAppointmentService } from '@/application/ports/IAppointmentService';
import {
  getAppointments,
  setAppointmentPaid,
  handlePayNow,
  checkIfPastAppointment,
  verifyStripePayment,
  verifyAndUpdatePayment,
  getUserRole,
} from '@/infrastructure/services/appointmentService';

export class AppointmentServiceAdapter implements IAppointmentService {
  async getAppointments(userId: string, isDoctor: boolean) {
    return getAppointments(userId, isDoctor);
  }

  async setAppointmentPaid(appointmentId: string): Promise<void> {
    await setAppointmentPaid(appointmentId);
  }

  async handlePayNow(appointmentId: string, amount: number): Promise<void> {
    await handlePayNow(appointmentId, amount);
  }

  async checkIfPastAppointment(appointmentId: string): Promise<boolean> {
    return checkIfPastAppointment(appointmentId);
  }

  async verifyStripePayment(appointmentId: string): Promise<void> {
    await verifyStripePayment(appointmentId, setAppointmentPaid);
  }

  async verifyAndUpdatePayment(
    sessionId: string,
    userId: string,
    isDoctor: boolean,
    onRefresh: (userId: string, isDoctor: boolean) => Promise<void>
  ): Promise<void> {
    await verifyAndUpdatePayment(sessionId, userId, isDoctor, setAppointmentPaid, onRefresh);
  }

  async getUserRole(userId: string): Promise<string> {
    return getUserRole(userId);
  }
}

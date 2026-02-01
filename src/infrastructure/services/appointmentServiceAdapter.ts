import { IAppointmentService } from '@/application/ports/IAppointmentService';
import {
  getAppointments,
  setAppointmentPaid,
  checkIfPastAppointment,
  getUserRole,
} from '@/infrastructure/services/appointmentService';

export class AppointmentServiceAdapter implements IAppointmentService {
  async getAppointments(userId: string, isDoctor: boolean) {
    return getAppointments(userId, isDoctor);
  }

  async setAppointmentPaid(appointmentId: string): Promise<void> {
    await setAppointmentPaid(appointmentId);
  }

  async checkIfPastAppointment(appointmentId: string): Promise<boolean> {
    return checkIfPastAppointment(appointmentId);
  }

  async getUserRole(userId: string): Promise<string> {
    return getUserRole(userId);
  }
}

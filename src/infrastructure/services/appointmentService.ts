import type { IAppointmentService, CreateAppointmentInput } from '@/application/ports/IAppointmentService';
import type { Appointment } from '@/domain/entities/Appointment';
import {
  listAppointments,
  createAppointment,
} from '@/network/appointments';

export class AppointmentService implements IAppointmentService {
  async getAppointments(_userId: string, _isDoctor: boolean): Promise<Appointment[]> {
    const res = await listAppointments();
    return res.items;
  }

  async setAppointmentPaid(_appointmentId: string): Promise<void> {
    // implemented via AppointmentPaymentService
  }

  async checkIfPastAppointment(_appointmentId: string): Promise<boolean> {
    return false;
  }

  async getUserRole(_userId: string): Promise<string> {
    return '';
  }

  async listAppointments(): Promise<Appointment[]> {
    const res = await listAppointments();
    return res.items;
  }

  async createAppointment(input: CreateAppointmentInput): Promise<Appointment> {
    return createAppointment(input);
  }
}

import { Appointment } from '@/domain/entities/Appointment';

export interface IAppointmentService {
  getAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  setAppointmentPaid(appointmentId: string): Promise<void>;
  checkIfPastAppointment(appointmentId: string): Promise<boolean>;
  getUserRole(userId: string): Promise<string>;
}

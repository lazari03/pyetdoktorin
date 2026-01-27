import { Appointment } from '@/domain/entities/Appointment';

export interface IAppointmentService {
  getAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  setAppointmentPaid(appointmentId: string): Promise<void>;
  handlePayNow(appointmentId: string, amount: number): Promise<void>;
  checkIfPastAppointment(appointmentId: string): Promise<boolean>;
  verifyStripePayment(appointmentId: string): Promise<void>;
  verifyAndUpdatePayment(sessionId: string, userId: string, isDoctor: boolean): Promise<void>;
  getUserRole(userId: string): Promise<string>;
}

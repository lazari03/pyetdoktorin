import { Appointment } from '@/domain/entities/Appointment';

export interface CreateAppointmentInput {
  doctorId: string;
  doctorName: string;
  appointmentType?: string;
  preferredDate: string;
  preferredTime?: string;
  note?: string;
  bookingFor?: 'self' | 'family';
  familyMemberId?: string;
}

export interface IAppointmentService {
  getAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  setAppointmentPaid(appointmentId: string): Promise<void>;
  checkIfPastAppointment(appointmentId: string): Promise<boolean>;
  getUserRole(userId: string): Promise<string>;
  listAppointments(): Promise<Appointment[]>;
  createAppointment(input: CreateAppointmentInput): Promise<Appointment>;
}

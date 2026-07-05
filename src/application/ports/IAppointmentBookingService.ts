import type { Appointment } from '@/domain/entities/Appointment';
import type { ResolvedTimeSlot } from '@/domain/entities/DoctorAvailability';

export interface IAppointmentBookingService {
  getResolvedSlots(doctorId: string, date: string): Promise<ResolvedTimeSlot[]>;
  createAppointment(payload: {
    doctorId: string;
    doctorName: string;
    appointmentType?: string;
    preferredDate: string;
    preferredTime?: string;
    note?: string;
  }): Promise<Appointment>;
}

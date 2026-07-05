import type { IAppointmentBookingService } from '@/application/ports/IAppointmentBookingService';
import { createAppointment } from '@/network/appointments';
import { getResolvedAvailabilitySlots } from '@/network/availability';

export class AppointmentBookingServiceAdapter implements IAppointmentBookingService {
  async getResolvedSlots(doctorId: string, date: string) {
    return getResolvedAvailabilitySlots(doctorId, date);
  }

  async createAppointment(payload: {
    doctorId: string;
    doctorName: string;
    appointmentType?: string;
    preferredDate: string;
    preferredTime?: string;
    note?: string;
  }) {
    return createAppointment(payload);
  }
}

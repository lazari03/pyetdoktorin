import type { IQuickAppointmentService } from '@/application/ports/IQuickAppointmentService';
import type { QuickAppointmentQuery, QuickAppointmentResponse } from '@/domain/entities/QuickAppointment';
import { getQuickAppointmentMatches } from '@/network/quickAppointments';

export class QuickAppointmentService implements IQuickAppointmentService {
  async getMatches(query: QuickAppointmentQuery): Promise<QuickAppointmentResponse> {
    return getQuickAppointmentMatches(query);
  }
}
import type { QuickAppointmentQuery, QuickAppointmentResponse } from '@/domain/entities/QuickAppointment';

export interface IQuickAppointmentService {
  getMatches(query: QuickAppointmentQuery): Promise<QuickAppointmentResponse>;
}
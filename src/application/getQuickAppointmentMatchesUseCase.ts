import type { QuickAppointmentQuery, QuickAppointmentResponse } from '@/domain/entities/QuickAppointment';
import type { IQuickAppointmentService } from '@/application/ports/IQuickAppointmentService';

export class GetQuickAppointmentMatchesUseCase {
  constructor(private quickAppointmentService: IQuickAppointmentService) {}

  async execute(query: QuickAppointmentQuery): Promise<QuickAppointmentResponse> {
    return this.quickAppointmentService.getMatches(query);
  }
}
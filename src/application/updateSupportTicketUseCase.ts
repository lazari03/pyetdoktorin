import type { IAdminSupportTicketsService, UpdateSupportTicketInput } from '@/application/ports/IAdminSupportTicketsService';
import type { SupportTicket } from '@/application/ports/ISupportTicketService';

export class UpdateSupportTicketUseCase {
  constructor(private adminSupportTicketsService: IAdminSupportTicketsService) {}

  async execute(id: string, input: UpdateSupportTicketInput): Promise<SupportTicket> {
    return this.adminSupportTicketsService.update(id, input);
  }
}

import type { IAdminSupportTicketsService } from '@/application/ports/IAdminSupportTicketsService';
import type { SupportTicket } from '@/application/ports/ISupportTicketService';

export class ListSupportTicketsUseCase {
  constructor(private adminSupportTicketsService: IAdminSupportTicketsService) {}

  async execute(): Promise<SupportTicket[]> {
    return this.adminSupportTicketsService.list();
  }
}

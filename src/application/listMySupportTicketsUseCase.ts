import type { ISupportTicketService, SupportTicket } from '@/application/ports/ISupportTicketService';

export class ListMySupportTicketsUseCase {
  constructor(private supportTicketService: ISupportTicketService) {}

  async execute(): Promise<SupportTicket[]> {
    return this.supportTicketService.listMine();
  }
}

import type { CreateSupportTicketInput, ISupportTicketService, SupportTicket } from '@/application/ports/ISupportTicketService';

export class CreateSupportTicketUseCase {
  constructor(private supportTicketService: ISupportTicketService) {}

  async execute(input: CreateSupportTicketInput): Promise<SupportTicket> {
    return this.supportTicketService.create(input);
  }
}

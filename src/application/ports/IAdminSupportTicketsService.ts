import type { SupportTicket, SupportTicketStatus } from '@/application/ports/ISupportTicketService';

export interface UpdateSupportTicketInput {
  status?: SupportTicketStatus;
  adminNotes?: string;
}

export interface IAdminSupportTicketsService {
  list(): Promise<SupportTicket[]>;
  update(id: string, input: UpdateSupportTicketInput): Promise<SupportTicket>;
}

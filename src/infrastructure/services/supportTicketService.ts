import type {
  CreateSupportTicketInput,
  ISupportTicketService,
  SupportTicket,
} from '@/application/ports/ISupportTicketService';
import { backendFetch } from '@/network/backendClient';

export class SupportTicketService implements ISupportTicketService {
  async create(input: CreateSupportTicketInput): Promise<SupportTicket> {
    const result = await backendFetch<{ ticket: SupportTicket }>('/api/support-tickets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return result.ticket;
  }

  async listMine(): Promise<SupportTicket[]> {
    const result = await backendFetch<{ items: SupportTicket[] }>('/api/support-tickets/mine');
    return result.items;
  }
}

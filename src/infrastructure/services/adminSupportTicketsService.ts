import type {
  IAdminSupportTicketsService,
  UpdateSupportTicketInput,
} from '@/application/ports/IAdminSupportTicketsService';
import type { SupportTicket } from '@/application/ports/ISupportTicketService';
import { backendFetch } from '@/network/backendClient';

export class AdminSupportTicketsService implements IAdminSupportTicketsService {
  async list(): Promise<SupportTicket[]> {
    const result = await backendFetch<{ items: SupportTicket[] }>('/api/support-tickets');
    return result.items;
  }

  async update(id: string, input: UpdateSupportTicketInput): Promise<SupportTicket> {
    const result = await backendFetch<{ ticket: SupportTicket }>(`/api/support-tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    return result.ticket;
  }
}

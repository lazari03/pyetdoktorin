export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  topic: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  adminNotes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateSupportTicketInput {
  topic: string;
  subject: string;
  message: string;
}

export interface ISupportTicketService {
  create(input: CreateSupportTicketInput): Promise<SupportTicket>;
  listMine(): Promise<SupportTicket[]>;
}

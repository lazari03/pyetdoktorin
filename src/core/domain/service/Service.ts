export type ServiceStatus = 'connected' | 'disconnected' | 'error';

export interface Service {
  id: string;
  name: string;
  description: string;
  category?: string;
  status: ServiceStatus;
  connectedAt?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

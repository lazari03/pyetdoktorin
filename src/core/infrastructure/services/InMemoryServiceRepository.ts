import { Service, ServiceStatus } from '@/core/domain/service/Service';
import { ServiceRepository } from '@/core/application/services/ports/ServiceRepository';
import { NotFoundError } from '@/core/domain/errors/NotFoundError';
import { env } from '@/core/infrastructure/config/env';

const defaultServices: Service[] = [
  {
    id: 'recaptcha',
    name: 'Google reCAPTCHA',
    description: 'Form protection and bot detection.',
    category: 'Security',
    status: env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ? 'connected' : 'disconnected',
  },
  {
    id: 'ga',
    name: 'Google Analytics',
    description: 'Site analytics and traffic insights.',
    category: 'Analytics',
    status: env.NEXT_PUBLIC_GA_ID ? 'connected' : 'disconnected',
  },
  {
    id: 'vonage',
    name: 'Vonage SMS',
    description: 'SMS notifications for appointments.',
    category: 'Messaging',
    status: env.NEXT_PUBLIC_VONAGE_API_KEY && env.NEXT_PUBLIC_VONAGE_API_SECRET ? 'connected' : 'disconnected',
  },
];

const serviceState = new Map<string, Service>(defaultServices.map((service) => [service.id, service]));

export class InMemoryServiceRepository implements ServiceRepository {
  async list(): Promise<Service[]> {
    return Array.from(serviceState.values());
  }

  async updateStatus(id: string, status: ServiceStatus, metadata?: Partial<Service>): Promise<Service> {
    const current = serviceState.get(id);
    if (!current) {
      throw new NotFoundError('Service');
    }
    const updated: Service = { ...current, ...metadata, status };
    serviceState.set(id, updated);
    return updated;
  }
}

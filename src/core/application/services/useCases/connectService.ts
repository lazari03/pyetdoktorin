import { ServiceRepository } from '../ports/ServiceRepository';
import { ServiceConnector } from '../ports/ServiceConnector';
import { DomainError } from '@/core/domain/errors/DomainError';

export async function connectService(
  serviceId: string,
  serviceRepository: ServiceRepository,
  serviceConnector: ServiceConnector,
) {
  if (!serviceId) {
    throw new DomainError('Service id is required');
  }
  await serviceConnector.connect(serviceId);
  return serviceRepository.updateStatus(serviceId, 'connected', { connectedAt: new Date().toISOString() });
}

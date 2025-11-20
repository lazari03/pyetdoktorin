import { ServiceRepository } from '../ports/ServiceRepository';
import { ServiceConnector } from '../ports/ServiceConnector';
import { DomainError } from '@/core/domain/errors/DomainError';

export async function disconnectService(
  serviceId: string,
  serviceRepository: ServiceRepository,
  serviceConnector: ServiceConnector,
) {
  if (!serviceId) {
    throw new DomainError('Service id is required');
  }
  await serviceConnector.disconnect(serviceId);
  return serviceRepository.updateStatus(serviceId, 'disconnected');
}

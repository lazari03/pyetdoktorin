import { Service } from '@/core/domain/service/Service';
import { ServiceRepository } from '../ports/ServiceRepository';

export async function listConnectedServices(serviceRepository: ServiceRepository): Promise<Service[]> {
  return serviceRepository.list();
}

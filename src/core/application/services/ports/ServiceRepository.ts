import { Service, ServiceStatus } from '@/core/domain/service/Service';

export interface ServiceRepository {
  list(): Promise<Service[]>;
  updateStatus(id: string, status: ServiceStatus, metadata?: Partial<Service>): Promise<Service>;
}

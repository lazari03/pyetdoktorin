import { InMemoryServiceRepository } from './InMemoryServiceRepository';
import { ServiceConnectorImpl } from './ServiceConnectorImpl';

export const serviceRepository = new InMemoryServiceRepository();
export const serviceConnector = new ServiceConnectorImpl();

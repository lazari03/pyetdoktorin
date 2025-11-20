import { ServiceConnector } from '@/core/application/services/ports/ServiceConnector';

export class ServiceConnectorImpl implements ServiceConnector {
  async connect(): Promise<void> {
    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }
}

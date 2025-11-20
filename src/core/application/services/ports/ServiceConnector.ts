export interface ServiceConnector {
  connect(serviceId: string): Promise<void>;
  disconnect(serviceId: string): Promise<void>;
}

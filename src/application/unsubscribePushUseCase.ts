import type { IPushNotificationsService } from '@/application/ports/IPushNotificationsService';

export class UnsubscribePushUseCase {
  constructor(private pushNotificationsService: IPushNotificationsService) {}

  async execute(endpoint: string): Promise<void> {
    return this.pushNotificationsService.unsubscribe(endpoint);
  }
}

import type { IPushNotificationsService, PushSubscriptionKeys } from '@/application/ports/IPushNotificationsService';

export class SubscribePushUseCase {
  constructor(private pushNotificationsService: IPushNotificationsService) {}

  async execute(subscription: PushSubscriptionKeys): Promise<void> {
    return this.pushNotificationsService.subscribe(subscription);
  }
}

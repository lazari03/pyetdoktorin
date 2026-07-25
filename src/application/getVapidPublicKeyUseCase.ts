import type { IPushNotificationsService } from '@/application/ports/IPushNotificationsService';

export class GetVapidPublicKeyUseCase {
  constructor(private pushNotificationsService: IPushNotificationsService) {}

  async execute(): Promise<string> {
    return this.pushNotificationsService.getVapidPublicKey();
  }
}

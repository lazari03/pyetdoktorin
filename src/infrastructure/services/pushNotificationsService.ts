import type { IPushNotificationsService, PushSubscriptionKeys } from '@/application/ports/IPushNotificationsService';
import { backendFetch } from '@/network/backendClient';

export class PushNotificationsService implements IPushNotificationsService {
  async getVapidPublicKey(): Promise<string> {
    const result = await backendFetch<{ publicKey: string }>('/api/push/vapid-public-key');
    return result.publicKey;
  }

  async subscribe(subscription: PushSubscriptionKeys): Promise<void> {
    await backendFetch('/api/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    });
  }

  async unsubscribe(endpoint: string): Promise<void> {
    await backendFetch('/api/push/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    });
  }
}

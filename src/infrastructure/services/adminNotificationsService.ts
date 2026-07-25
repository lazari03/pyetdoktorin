import type {
  BroadcastNotificationInput,
  IAdminNotificationsService,
} from '@/application/ports/IAdminNotificationsService';
import { backendFetch } from '@/network/backendClient';

export class AdminNotificationsService implements IAdminNotificationsService {
  async broadcast(input: BroadcastNotificationInput): Promise<{ ok: boolean; count: number }> {
    return backendFetch<{ ok: boolean; count: number }>('/api/user-notifications/admin/broadcast', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }
}

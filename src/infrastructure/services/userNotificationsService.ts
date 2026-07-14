import type { IUserNotificationsService, UserNotificationDTO } from '@/application/ports/IUserNotificationsService';
import { backendFetch } from '@/network/backendClient';

export class UserNotificationsService implements IUserNotificationsService {
  async list(): Promise<{ items: UserNotificationDTO[]; unreadCount: number }> {
    return backendFetch<{ items: UserNotificationDTO[]; unreadCount: number }>('/api/user-notifications');
  }

  async getUnreadCount(): Promise<number> {
    const result = await backendFetch<{ unreadCount: number }>('/api/user-notifications/unread-count');
    return result.unreadCount;
  }

  async markRead(id: string): Promise<void> {
    await backendFetch(`/api/user-notifications/${id}/read`, { method: 'POST' });
  }

  async markAllRead(): Promise<{ updated: number }> {
    return backendFetch<{ ok: boolean; updated: number }>('/api/user-notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async requestExport(): Promise<void> {
    await backendFetch('/api/user-notifications/export', { method: 'POST' });
  }
}

export interface UserNotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  readAt: number | null;
  createdAt: number;
}

export interface IUserNotificationsService {
  list(): Promise<{ items: UserNotificationDTO[]; unreadCount: number }>;
  getUnreadCount(): Promise<number>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<{ updated: number }>;
  requestExport(): Promise<void>;
}

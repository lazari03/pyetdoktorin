import { Notification, AppointmentNotification } from '../entities/Notification';

export interface INotificationRepository {
  // Basic CRUD operations
  getById(id: string): Promise<Notification | null>;
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  update(id: string, updates: Partial<Notification>): Promise<Notification>;
  delete(id: string): Promise<void>;

  // User-specific queries
  getUserNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  getActiveNotifications(userId: string): Promise<Notification[]>;

  // Type-specific queries
  getAppointmentNotifications(userId: string): Promise<AppointmentNotification[]>;
  getPaymentNotifications(userId: string): Promise<Notification[]>;
  getSystemNotifications(userId: string): Promise<Notification[]>;

  // Status operations
  markAsRead(notificationId: string): Promise<Notification>;
  markMultipleAsRead(notificationIds: string[]): Promise<Notification[]>;
  dismissNotification(notificationId: string): Promise<Notification>;
  dismissMultiple(notificationIds: string[]): Promise<Notification[]>;

  // Batch operations
  markAllAsRead(userId: string): Promise<Notification[]>;
  dismissAll(userId: string): Promise<Notification[]>;
  deleteReadNotifications(userId: string): Promise<void>;

  // Search and filtering
  findByDateRange(userId: string, startDate: string, endDate: string): Promise<Notification[]>;
  findByType(userId: string, type: string): Promise<Notification[]>;

  // Real-time subscriptions
  subscribeToUserNotifications(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void;

  // Cleanup operations
  deleteOldNotifications(daysOld: number): Promise<number>;
}
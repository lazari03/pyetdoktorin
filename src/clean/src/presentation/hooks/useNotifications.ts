import { useState, useEffect } from 'react';
import { Notification } from '../../../domain/entities/Notification';
import { CreateNotificationUseCase } from '../../../application/use-cases/CreateNotificationUseCase';

export interface UseNotificationsParams {
  userId: string;
  createNotificationUseCase: CreateNotificationUseCase;
}

export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  dismissAll: () => Promise<void>;
}

export const useNotifications = ({
  userId,
  createNotificationUseCase
}: UseNotificationsParams): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const userNotifications = await createNotificationUseCase.getUserNotifications(userId);
      setNotifications(userNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const updatedNotification = await createNotificationUseCase.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId ? updatedNotification : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await createNotificationUseCase.markAllAsRead(userId);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all notifications as read');
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const updatedNotification = await createNotificationUseCase.dismissNotification(notificationId);
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId ? updatedNotification : notification
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss notification');
    }
  };

  const dismissAll = async () => {
    try {
      await createNotificationUseCase.dismissAll(userId);
      await fetchNotifications();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dismiss all notifications');
    }
  };

  const unreadCount = notifications.filter(notification => notification.isUnread()).length;

  useEffect(() => {
    fetchNotifications();
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    dismissAll
  };
};
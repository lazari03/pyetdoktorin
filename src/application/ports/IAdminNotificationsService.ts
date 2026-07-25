export type NotificationBroadcastTarget = 'all' | 'patient' | 'doctor' | 'pharmacy';

export interface BroadcastNotificationInput {
  title: string;
  body: string;
  target: NotificationBroadcastTarget;
}

export interface IAdminNotificationsService {
  broadcast(input: BroadcastNotificationInput): Promise<{ ok: boolean; count: number }>;
}

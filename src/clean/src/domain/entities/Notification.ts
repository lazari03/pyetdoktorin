export interface NotificationData {
  id: string;
  userId: string;
  type: 'appointment' | 'payment' | 'system' | 'profile';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
}

export class Notification {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly type: 'appointment' | 'payment' | 'system' | 'profile',
    public readonly title: string,
    public readonly message: string,
    public readonly data: Record<string, any> | undefined,
    public readonly read: boolean,
    public readonly dismissed: boolean,
    public readonly createdAt: string
  ) {}

  static create(params: NotificationData): Notification {
    return new Notification(
      params.id,
      params.userId,
      params.type,
      params.title,
      params.message,
      params.data,
      params.read,
      params.dismissed,
      params.createdAt
    );
  }

  markAsRead(): Notification {
    return Notification.create({
      ...this,
      read: true
    });
  }

  dismiss(): Notification {
    return Notification.create({
      ...this,
      dismissed: true
    });
  }

  isUnread(): boolean {
    return !this.read;
  }

  isActive(): boolean {
    return !this.dismissed;
  }
}

export interface AppointmentNotificationData extends NotificationData {
  appointmentId: string;
  action: 'created' | 'confirmed' | 'cancelled' | 'completed' | 'payment_required';
}

export class AppointmentNotification extends Notification {
  constructor(data: AppointmentNotificationData) {
    super({
      ...data,
      type: 'appointment'
    });
  }

  getAppointmentId(): string {
    return this.data?.appointmentId || '';
  }

  getAction(): string {
    return this.data?.action || '';
  }

  static create(params: Omit<AppointmentNotificationData, 'type'>): AppointmentNotification {
    return new AppointmentNotification({
      ...params,
      type: 'appointment' as const
    });
  }
}
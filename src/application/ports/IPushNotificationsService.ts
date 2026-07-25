export interface PushSubscriptionKeys {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

export interface IPushNotificationsService {
  getVapidPublicKey(): Promise<string>;
  subscribe(subscription: PushSubscriptionKeys): Promise<void>;
  unsubscribe(endpoint: string): Promise<void>;
}

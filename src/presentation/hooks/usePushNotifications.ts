import { useCallback, useEffect, useState } from 'react';
import { useDI } from '@/context/DIContext';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type PushSupportStatus = 'unsupported' | 'default' | 'granted' | 'denied' | 'subscribed';

export function usePushNotifications() {
  const { getVapidPublicKeyUseCase, subscribePushUseCase, unsubscribePushUseCase } = useDI();
  const [status, setStatus] = useState<PushSupportStatus>('default');

  const supported = typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;

  useEffect(() => {
    if (!supported) {
      setStatus('unsupported');
      return;
    }
    if (Notification.permission === 'denied') {
      setStatus('denied');
      return;
    }
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? 'subscribed' : 'default'))
      .catch(() => setStatus('default'));
  }, [supported]);

  const enable = useCallback(async () => {
    if (!supported) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      setStatus(permission === 'denied' ? 'denied' : 'default');
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const publicKey = await getVapidPublicKeyUseCase.execute();
    if (!publicKey) {
      setStatus('default');
      return;
    }
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    });
    const json = subscription.toJSON();
    await subscribePushUseCase.execute({
      endpoint: json.endpoint!,
      keys: { p256dh: json.keys!.p256dh, auth: json.keys!.auth },
    });
    setStatus('subscribed');
  }, [supported, getVapidPublicKeyUseCase, subscribePushUseCase]);

  const disable = useCallback(async () => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      setStatus('default');
      return;
    }
    await unsubscribePushUseCase.execute(subscription.endpoint);
    await subscription.unsubscribe();
    setStatus('default');
  }, [unsubscribePushUseCase]);

  return { status, supported, enable, disable };
}

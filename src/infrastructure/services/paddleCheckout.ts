'use client';

type PaddleCheckout = {
  open: (config: Record<string, unknown>) => void;
};

type PaddleClient = {
  Initialize?: (config: Record<string, unknown>) => void;
  Environment?: { set?: (env: string) => void };
  Checkout?: PaddleCheckout;
};

declare global {
  interface Window {
    Paddle?: PaddleClient;
    __paddleInitialized?: boolean;
  }
}

let paddleScriptPromise: Promise<void> | null = null;

function loadPaddleScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Paddle not available on server'));
  }
  if (window.Paddle) {
    return Promise.resolve();
  }
  if (paddleScriptPromise) {
    return paddleScriptPromise;
  }
  paddleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-paddle-sdk="true"]');
    if (existing) {
      if (existing.getAttribute('data-loaded') === 'true') {
        resolve();
        return;
      }
      existing.addEventListener('load', () => {
        existing.setAttribute('data-loaded', 'true');
        resolve();
      }, { once: true });
      existing.addEventListener('error', () => {
        paddleScriptPromise = null;
        reject(new Error('Failed to load Paddle SDK'));
      }, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
    script.async = true;
    script.setAttribute('data-paddle-sdk', 'true');
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => {
      paddleScriptPromise = null;
      reject(new Error('Failed to load Paddle SDK'));
    };
    document.head.appendChild(script);
  });
  return paddleScriptPromise;
}

async function ensurePaddleInitialized(): Promise<PaddleClient> {
  await loadPaddleScript();
  const paddle = window.Paddle;
  if (!paddle) {
    throw new Error('Paddle SDK not loaded');
  }
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '';
  const env = process.env.NEXT_PUBLIC_PADDLE_ENV || 'sandbox';
  if (!token) {
    throw new Error('Missing Paddle client token');
  }
  if (paddle.Environment?.set && env === 'sandbox') {
    paddle.Environment.set('sandbox');
  }
  if (!window.__paddleInitialized && paddle.Initialize) {
    paddle.Initialize({ token });
    window.__paddleInitialized = true;
  }
  return paddle;
}

export async function preparePaddleCheckout(): Promise<void> {
  await ensurePaddleInitialized();
}

export async function openPaddleCheckout(params: {
  appointmentId: string;
  userId?: string | null;
  onClose?: () => void;
}): Promise<void> {
  if (!params.appointmentId) {
    throw new Error('Missing appointment id');
  }
  const paddle = await ensurePaddleInitialized();
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID || '';
  if (!priceId) {
    throw new Error('Missing Paddle price id');
  }
  if (!paddle.Checkout?.open) {
    throw new Error('Paddle checkout is unavailable');
  }
  const successUrl = new URL(window.location.href);
  if (successUrl.pathname.startsWith('/dashboard/pay')) {
    successUrl.pathname = '/dashboard/appointments';
    successUrl.searchParams.delete('appointmentId');
  }
  successUrl.searchParams.set('paid', params.appointmentId);
  let closed = false;
  const closeOnce = () => {
    if (closed) return;
    closed = true;
    params.onClose?.();
  };

  const eventCallback = (event: unknown) => {
    const nameRaw = (event as { name?: unknown })?.name;
    const name = typeof nameRaw === 'string' ? nameRaw.toLowerCase() : '';
    if (!name) return;
    if (name.includes('close') || name.includes('closed') || name.includes('complete') || name.includes('completed')) {
      closeOnce();
    }
  };

  paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customData: { appointmentId: params.appointmentId, userId: params.userId ?? null },
    settings: {
      displayMode: 'overlay',
      successUrl: successUrl.toString(),
    },
    // Some Paddle SDK versions expect successUrl at the top level.
    successUrl: successUrl.toString(),
    closeCallback: closeOnce,
    // Some Paddle SDK versions expose checkout lifecycle events via eventCallback.
    eventCallback,
    onClose: closeOnce,
  } as Record<string, unknown>);
}

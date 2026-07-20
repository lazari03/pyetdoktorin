'use client';

import { backendFetch } from '@/network/backendClient';

type PayPalButtonsInstance = {
  render: (selector: string) => void;
};

type PayPalOnApproveData = { orderID: string };

type PayPalClient = {
  Buttons?: (config: {
    createOrder: () => Promise<string>;
    onApprove: (data: PayPalOnApproveData) => Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => PayPalButtonsInstance;
};

declare global {
  interface Window {
    paypal?: PayPalClient;
  }
}

let paypalScriptPromise: Promise<void> | null = null;

function loadPayPalScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('PayPal not available on server'));
  }
  if (window.paypal) {
    return Promise.resolve();
  }
  if (paypalScriptPromise) {
    return paypalScriptPromise;
  }
  paypalScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
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
        paypalScriptPromise = null;
        reject(new Error('Failed to load PayPal SDK'));
      }, { once: true });
      return;
    }
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
    if (!clientId) {
      paypalScriptPromise = null;
      reject(new Error('Missing PayPal client id'));
      return;
    }
    const script = document.createElement('script');
    const currency = process.env.NEXT_PUBLIC_APPOINTMENT_PRICE_CURRENCY || 'EUR';
    const params = new URLSearchParams({ 'client-id': clientId, currency, intent: 'capture' });
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.setAttribute('data-paypal-sdk', 'true');
    script.onload = () => {
      script.setAttribute('data-loaded', 'true');
      resolve();
    };
    script.onerror = () => {
      paypalScriptPromise = null;
      reject(new Error('Failed to load PayPal SDK'));
    };
    document.head.appendChild(script);
  });
  return paypalScriptPromise;
}

export async function preparePayPalCheckout(): Promise<void> {
  await loadPayPalScript();
}

// Guards against rendering the buttons twice into the same container — e.g.
// React's dev-mode double-invoked effects, or an unmemoized DI object
// retriggering the caller's effect. PayPal's SDK doesn't dedupe this itself.
// Checked against the live DOM element (not a persistent module-level flag)
// so navigating away and back to the page — a fresh element, same id —
// correctly renders again instead of being permanently skipped.
function containerAlreadyRendered(containerId: string): boolean {
  const el = document.getElementById(containerId);
  return !!el && el.childElementCount > 0;
}

export async function renderPayPalButtons(params: {
  containerId: string;
  appointmentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (err: unknown) => void;
}): Promise<void> {
  if (!params.appointmentId) {
    throw new Error('Missing appointment id');
  }
  if (containerAlreadyRendered(params.containerId)) {
    return;
  }
  await loadPayPalScript();
  const paypal = window.paypal;
  if (!paypal?.Buttons) {
    throw new Error('PayPal checkout is unavailable');
  }
  // Re-check after the await — two concurrent calls could both pass the
  // synchronous check above before either finishes loading the script.
  if (containerAlreadyRendered(params.containerId)) {
    return;
  }

  paypal.Buttons({
    createOrder: async () => {
      const order = await backendFetch<{ orderId: string }>('/api/paypal/create-order', {
        method: 'POST',
        body: JSON.stringify({ appointmentId: params.appointmentId }),
      });
      return order.orderId;
    },
    onApprove: async (data) => {
      try {
        await backendFetch('/api/paypal/capture-order', {
          method: 'POST',
          body: JSON.stringify({ appointmentId: params.appointmentId, orderId: data.orderID }),
        });
        params.onSuccess?.();
      } catch (err) {
        params.onError?.(err);
      }
    },
    onCancel: () => {
      params.onCancel?.();
    },
    onError: (err) => {
      params.onError?.(err);
    },
  }).render(`#${params.containerId}`);
}

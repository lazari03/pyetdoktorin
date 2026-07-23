import { backendFetch } from "./backendClient";

export type PaymentSyncResponse = {
  ok: boolean;
  updated?: boolean;
  isPaid?: boolean;
};

/**
 * Paddle's overlay checkout doesn't confirm payment back to us synchronously,
 * so after it closes we ask the backend to check Paddle's own Transactions
 * API for a match (the webhook may not have landed yet).
 */
export async function syncPayment(appointmentId: string): Promise<PaymentSyncResponse> {
  if (!appointmentId) {
    throw new Error("Missing appointment id");
  }
  return backendFetch<PaymentSyncResponse>(`/api/paddle/sync`, {
    method: "POST",
    body: JSON.stringify({ appointmentId }),
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncPaymentWithRetry(
  appointmentId: string,
  options?: { maxAttempts?: number; initialDelayMs?: number; backoffFactor?: number }
): Promise<PaymentSyncResponse> {
  const maxAttempts = options?.maxAttempts ?? 6;
  const initialDelayMs = options?.initialDelayMs ?? 600;
  const backoffFactor = options?.backoffFactor ?? 1.6;
  let delayMs = initialDelayMs;

  let lastResult: PaymentSyncResponse = { ok: false, updated: false, isPaid: false };
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await syncPayment(appointmentId);
      lastResult = result;
      if (result.isPaid) return result;
    } catch (error) {
      lastError = error;
    }
    if (attempt < maxAttempts) {
      await sleep(delayMs);
      delayMs = Math.round(delayMs * backoffFactor);
    }
  }

  if (lastError) {
    throw lastError;
  }
  return lastResult;
}

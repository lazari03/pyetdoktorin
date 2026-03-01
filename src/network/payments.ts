import { backendFetch } from "./backendClient";

export type PaddlePaymentSyncResponse = {
  ok: boolean;
  updated?: boolean;
  isPaid?: boolean;
};

export async function syncPaddlePayment(appointmentId: string): Promise<PaddlePaymentSyncResponse> {
  if (!appointmentId) {
    throw new Error("Missing appointment id");
  }
  return backendFetch<PaddlePaymentSyncResponse>(`/api/paddle/sync`, {
    method: "POST",
    body: JSON.stringify({ appointmentId }),
  });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function syncPaddlePaymentWithRetry(
  appointmentId: string,
  options?: { maxAttempts?: number; initialDelayMs?: number; backoffFactor?: number }
): Promise<PaddlePaymentSyncResponse> {
  const maxAttempts = options?.maxAttempts ?? 6;
  const initialDelayMs = options?.initialDelayMs ?? 600;
  const backoffFactor = options?.backoffFactor ?? 1.6;
  let delayMs = initialDelayMs;

  let lastResult: PaddlePaymentSyncResponse = { ok: false, updated: false, isPaid: false };
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await syncPaddlePayment(appointmentId);
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

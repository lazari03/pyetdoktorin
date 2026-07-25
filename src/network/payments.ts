import { getAppointment } from "./appointments";

export type PaymentSyncResponse = {
  ok: boolean;
  updated?: boolean;
  isPaid?: boolean;
};

/**
 * Payment capture is expected to be synchronous, so this doesn't ask a
 * payment provider to "sync" — it just re-reads the appointment's own isPaid
 * flag, which the capture call (or a webhook reconciliation backup) has
 * already set by the time this is called.
 */
export async function syncPayment(appointmentId: string): Promise<PaymentSyncResponse> {
  if (!appointmentId) {
    throw new Error("Missing appointment id");
  }
  const appointment = await getAppointment(appointmentId);
  return { ok: true, updated: appointment.isPaid, isPaid: appointment.isPaid };
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

import { backendFetch } from "./backendClient";

export async function syncPaddlePayment(appointmentId: string) {
  if (!appointmentId) {
    throw new Error("Missing appointment id");
  }
  return backendFetch<{ ok: boolean; updated?: boolean }>(`/api/paddle/sync`, {
    method: "POST",
    body: JSON.stringify({ appointmentId }),
  });
}

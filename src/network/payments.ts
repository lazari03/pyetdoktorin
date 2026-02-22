import { backendFetch } from './backendClient';

export async function syncPaddlePayment(appointmentId: string): Promise<{ ok: boolean; matched?: boolean }> {
  return backendFetch('/api/paddle/sync', {
    method: 'POST',
    body: JSON.stringify({ appointmentId }),
  });
}

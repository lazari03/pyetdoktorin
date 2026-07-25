import type { IReadMarksService } from '@/application/ports/IReadMarksService';
import { backendFetch } from '@/network/backendClient';

export class ReadMarksService implements IReadMarksService {
  async list(): Promise<string[]> {
    const result = await backendFetch<{ ids: string[] }>('/api/user-notifications/read-marks');
    return result.ids;
  }

  async markRead(id: string): Promise<void> {
    await backendFetch('/api/user-notifications/read-marks', {
      method: 'POST',
      body: JSON.stringify({ id }),
    });
  }

  async markManyRead(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await backendFetch('/api/user-notifications/read-marks/batch', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }
}

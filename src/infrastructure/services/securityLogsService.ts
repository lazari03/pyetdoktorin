import type { ISecurityLogsService, SecurityLogEntry } from '@/application/ports/ISecurityLogsService';
import { backendFetch } from '@/network/backendClient';

export class SecurityLogsService implements ISecurityLogsService {
  async listLogs(limit: number): Promise<{ items: SecurityLogEntry[]; total: number }> {
    const query = new URLSearchParams({ limit: String(limit) });
    return backendFetch<{ items: SecurityLogEntry[]; total: number }>(
      `/api/security-logs?${query.toString()}`,
    );
  }
}

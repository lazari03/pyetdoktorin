import type { ISecurityLogsService, SecurityLogEntry } from './ports/ISecurityLogsService';

export class GetSecurityLogsUseCase {
  constructor(private service: ISecurityLogsService) {}
  async execute(limit: number): Promise<{ items: SecurityLogEntry[]; total: number }> {
    return this.service.listLogs(limit);
  }
}

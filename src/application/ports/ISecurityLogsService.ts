export interface SecurityLogEntry {
  id: string;
  type: string;
  success: boolean;
  reason?: string;
  userId?: string;
  accountName?: string;
  accountEmail?: string;
  role?: string;
  ipAddress?: string;
  forwardedFor?: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
  location?: string;
  requestPath?: string;
  requestMethod?: string;
  createdAt?: string;
}

export interface ISecurityLogsService {
  listLogs(limit: number): Promise<{ items: SecurityLogEntry[]; total: number }>;
}

import { backendFetch } from '@/network/backendClient';

export type SecurityLogEntry = {
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
};

export async function fetchSecurityLogs(limit = 100) {
  const query = new URLSearchParams({ limit: String(limit) });
  return backendFetch<{ items: SecurityLogEntry[]; total: number }>(
    `/api/security-logs?${query.toString()}`,
  );
}

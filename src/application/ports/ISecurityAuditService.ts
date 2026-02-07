export interface ISecurityAuditService {
  logVideoAccessAttempt(params: {
    userId: string;
    appointmentId: string;
    role: string;
    success: boolean;
    reason?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void>;
}

import { ISecurityAuditService } from '@/application/ports/ISecurityAuditService';
import { getAdmin } from '@/app/api/_lib/admin';

/**
 * Firebase implementation of security audit logging
 * Records video access attempts for security monitoring
 */
export class SecurityAuditService implements ISecurityAuditService {
  async logVideoAccessAttempt(params: {
    userId: string;
    appointmentId: string;
    role: string;
    success: boolean;
    reason?: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const { db } = getAdmin();
      await db.collection('securityAuditLogs').add({
        ...params,
        type: 'video_access_attempt',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silent fail - audit logging should not break functionality
      console.error('Failed to log security audit:', error);
    }
  }
}

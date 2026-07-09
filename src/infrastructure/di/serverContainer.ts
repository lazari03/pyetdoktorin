import { SecurityAuditService } from '@/infrastructure/services/securityAuditService';
import type { ISecurityAuditService } from '@/application/ports/ISecurityAuditService';

export const securityAuditService: ISecurityAuditService = new SecurityAuditService();

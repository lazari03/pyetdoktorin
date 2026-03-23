import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '@/middleware/auth';
import { UserRole } from '@/domain/entities/UserRole';
import { validateQuery } from '@/routes/validation';
import { listSecurityAuditLogs } from '@/services/securityAuditService';

const router = Router();

const querySchema = z.object({
  limit: z.string().optional(),
});

router.get('/', requireAuth([UserRole.Admin]), async (req, res) => {
  const query = validateQuery(res, querySchema, req.query, 'INVALID_QUERY');
  if (!query) return;

  try {
    const requestedLimit = Number.parseInt(query.limit ?? '100', 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(200, Math.max(1, requestedLimit))
      : 100;
    const items = await listSecurityAuditLogs(limit);
    res.json({ items, total: items.length });
  } catch (error) {
    console.error('Error loading security audit logs', error);
    res.status(500).json({ error: 'Failed to load security audit logs' });
  }
});

export default router;

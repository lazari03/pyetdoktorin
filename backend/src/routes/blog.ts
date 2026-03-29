import { Router } from 'express';
import { z } from 'zod';
import { UserRole } from '@/domain/entities/UserRole';
import { requireAuth, type AuthenticatedRequest } from '@/middleware/auth';
import { validateBody } from '@/routes/validation';
import {
  createAdminBlogPost,
  deleteAdminBlogPost,
  listAdminBlogPosts,
  updateAdminBlogPost,
  type BlogStatus,
} from '@/services/blogService';
import {
  resolveSecurityAccountSummary,
  type SecurityAccountSummary,
  writeSecurityAuditLog,
} from '@/services/securityAuditService';
import { logRequestError } from '@/utils/logging';

const router = Router();

const blogWriteSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(240).optional(),
  excerpt: z.string().min(1).max(1000),
  content: z.string().min(1).max(100000),
  tag: z.string().min(1).max(120),
  status: z.enum(['draft', 'published']),
  author: z.string().min(1).max(200).optional(),
  keywords: z.array(z.string().min(1).max(120)).max(50).optional(),
});

const blogPatchSchema = blogWriteSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: 'No fields to update',
});

async function resolveActorSummary(req: AuthenticatedRequest): Promise<SecurityAccountSummary | undefined> {
  if (!req.user) return undefined;
  try {
    const summary = await resolveSecurityAccountSummary(req.user.uid);
    return {
      ...summary,
      role: summary.role ?? req.user.role,
    };
  } catch {
    return {
      userId: req.user.uid,
      role: req.user.role,
    };
  }
}

async function safeAudit(
  req: AuthenticatedRequest,
  type: 'blog_post_created' | 'blog_post_updated' | 'blog_post_deleted',
  success: boolean,
  actor: SecurityAccountSummary | undefined,
  metadata: Record<string, unknown>,
  reason?: string,
) {
  try {
    await writeSecurityAuditLog({
      type,
      success,
      request: req,
      user: actor,
      metadata,
      ...(reason ? { reason } : {}),
    });
  } catch (error) {
    logRequestError('security_audit_write_failed', req, error, { auditType: type });
  }
}

router.get('/', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  try {
    const items = await listAdminBlogPosts();
    res.json({ items });
  } catch (error) {
    logRequestError('blog_list_failed', req, error);
    res.status(500).json({ error: 'Failed to load blog posts' });
  }
});

router.post('/', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, blogWriteSchema, req.body, 'INVALID_BLOG_PAYLOAD');
  if (!payload) return;

  const actor = await resolveActorSummary(req);
  try {
    const post = await createAdminBlogPost(payload);
    await safeAudit(req, 'blog_post_created', true, actor, {
      postId: post.id,
      slug: post.slug,
      status: post.status,
    });
    res.status(201).json(post);
  } catch (error) {
    await safeAudit(req, 'blog_post_created', false, actor, {
      slug: payload.slug,
      status: payload.status,
    }, error instanceof Error ? error.message : 'Failed to create blog post');
    logRequestError('blog_create_failed', req, error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

router.patch('/:id', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const payload = validateBody(res, blogPatchSchema, req.body, 'INVALID_BLOG_PATCH');
  if (!payload) return;

  const { id } = req.params as { id: string };
  const actor = await resolveActorSummary(req);
  try {
    const post = await updateAdminBlogPost(id, payload as Partial<{ title: string; slug: string; excerpt: string; content: string; tag: string; status: BlogStatus; author: string; keywords: string[] }>);
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    await safeAudit(req, 'blog_post_updated', true, actor, {
      postId: id,
      slug: post.slug,
      fields: Object.keys(payload),
    });
    res.json(post);
  } catch (error) {
    await safeAudit(req, 'blog_post_updated', false, actor, {
      postId: id,
      fields: Object.keys(payload),
    }, error instanceof Error ? error.message : 'Failed to update blog post');
    logRequestError('blog_update_failed', req, error, { postId: id });
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

router.delete('/:id', requireAuth([UserRole.Admin]), async (req: AuthenticatedRequest, res) => {
  const { id } = req.params as { id: string };
  const actor = await resolveActorSummary(req);
  try {
    const deleted = await deleteAdminBlogPost(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    await safeAudit(req, 'blog_post_deleted', true, actor, { postId: id });
    res.json({ ok: true });
  } catch (error) {
    await safeAudit(req, 'blog_post_deleted', false, actor, { postId: id }, error instanceof Error ? error.message : 'Failed to delete blog post');
    logRequestError('blog_delete_failed', req, error, { postId: id });
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;

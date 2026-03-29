import { getFirebaseAdmin } from '@/config/firebaseAdmin';

export type BlogStatus = 'draft' | 'published';

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tag: string;
  status: BlogStatus;
  author: string;
  keywords?: string[] | undefined;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | undefined;
};

export type BlogWriteInput = {
  title: string;
  slug?: string | undefined;
  excerpt: string;
  content: string;
  tag: string;
  status: BlogStatus;
  author?: string | undefined;
  keywords?: string[] | undefined;
};

export type BlogPatchInput = Partial<BlogWriteInput>;

const COLLECTION = 'blog';

export function slugifyBlogTitle(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function normalizeKeywords(value: string[] | undefined): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const keywords = value
    .map((entry) => String(entry).trim())
    .filter(Boolean)
    .slice(0, 50);
  return keywords.length > 0 ? keywords : undefined;
}

function mapBlogPost(id: string, data: Record<string, unknown>): BlogPost {
  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    excerpt: String(data.excerpt ?? ''),
    content: String(data.content ?? ''),
    tag: String(data.tag ?? ''),
    status: data.status === 'published' ? 'published' : 'draft',
    author: String(data.author ?? 'Ekipi i Pyet Doktorin'),
    keywords: Array.isArray(data.keywords) ? (data.keywords as string[]) : undefined,
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
    publishedAt: typeof data.publishedAt === 'string' && data.publishedAt ? data.publishedAt : undefined,
  };
}

export function buildCreateBlogPostPayload(input: BlogWriteInput, now = new Date().toISOString()) {
  const slug = (input.slug?.trim() || slugifyBlogTitle(input.title)).trim();
  return {
    title: input.title.trim(),
    slug,
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    tag: input.tag.trim(),
    status: input.status,
    author: input.author?.trim() || 'Ekipi i Pyet Doktorin',
    keywords: normalizeKeywords(input.keywords),
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === 'published' ? now : null,
  };
}

export function buildUpdateBlogPostPayload(
  existing: Record<string, unknown>,
  input: BlogPatchInput,
  now = new Date().toISOString(),
) {
  const nextStatus = input.status ?? (existing.status === 'published' ? 'published' : 'draft');
  const nextTitle = input.title?.trim() || String(existing.title ?? '');
  const nextSlug = input.slug?.trim() || String(existing.slug ?? '') || slugifyBlogTitle(nextTitle);
  const wasPublished = existing.status === 'published';
  const nextPublishedAt =
    nextStatus === 'published'
      ? (wasPublished ? existing.publishedAt ?? now : now)
      : null;

  return {
    ...(input.title !== undefined ? { title: nextTitle } : {}),
    ...(input.slug !== undefined || !existing.slug ? { slug: nextSlug } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt.trim() } : {}),
    ...(input.content !== undefined ? { content: input.content.trim() } : {}),
    ...(input.tag !== undefined ? { tag: input.tag.trim() } : {}),
    ...(input.status !== undefined ? { status: nextStatus } : {}),
    ...(input.author !== undefined ? { author: input.author.trim() || 'Ekipi i Pyet Doktorin' } : {}),
    ...(input.keywords !== undefined ? { keywords: normalizeKeywords(input.keywords) ?? [] } : {}),
    updatedAt: now,
    publishedAt: nextPublishedAt,
  };
}

export async function listAdminBlogPosts(): Promise<BlogPost[]> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection(COLLECTION).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => mapBlogPost(doc.id, doc.data() as Record<string, unknown>));
}

export async function createAdminBlogPost(input: BlogWriteInput): Promise<BlogPost> {
  const admin = getFirebaseAdmin();
  const payload = buildCreateBlogPostPayload(input);
  const docRef = await admin.firestore().collection(COLLECTION).add(payload);
  return mapBlogPost(docRef.id, payload);
}

export async function updateAdminBlogPost(id: string, input: BlogPatchInput): Promise<BlogPost | null> {
  const admin = getFirebaseAdmin();
  const docRef = admin.firestore().collection(COLLECTION).doc(id);
  const existing = await docRef.get();
  if (!existing.exists) return null;

  const payload = buildUpdateBlogPostPayload((existing.data() ?? {}) as Record<string, unknown>, input);
  await docRef.set(payload, { merge: true });
  const refreshed = await docRef.get();
  return mapBlogPost(refreshed.id, (refreshed.data() ?? {}) as Record<string, unknown>);
}

export async function deleteAdminBlogPost(id: string): Promise<boolean> {
  const admin = getFirebaseAdmin();
  const docRef = admin.firestore().collection(COLLECTION).doc(id);
  const existing = await docRef.get();
  if (!existing.exists) return false;
  await docRef.delete();
  return true;
}

export type BlogStatus = 'draft' | 'published';

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

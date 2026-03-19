import { getAdmin } from '@/app/api/_lib/admin';
import type { BlogPost } from '@/domain/entities/BlogPost';

function docToBlogPost(id: string, data: Record<string, unknown>): BlogPost {
  return {
    id,
    title: String(data.title ?? ''),
    slug: String(data.slug ?? ''),
    excerpt: String(data.excerpt ?? ''),
    content: String(data.content ?? ''),
    tag: String(data.tag ?? ''),
    status: (data.status as BlogPost['status']) ?? 'draft',
    author: String(data.author ?? 'Ekipi i Pyet Doktorin'),
    createdAt: String(data.createdAt ?? ''),
    updatedAt: String(data.updatedAt ?? ''),
    publishedAt: data.publishedAt ? String(data.publishedAt) : undefined,
  };
}

export async function getPublishedBlogPostsServer(): Promise<BlogPost[]> {
  const { db } = getAdmin();
  const snap = await db
    .collection('blog')
    .where('status', '==', 'published')
    .orderBy('publishedAt', 'desc')
    .get();
  return snap.docs.map((d) => docToBlogPost(d.id, d.data() as Record<string, unknown>));
}

export async function getBlogPostBySlugServer(slug: string): Promise<BlogPost | null> {
  const { db } = getAdmin();
  const snap = await db
    .collection('blog')
    .where('slug', '==', slug)
    .where('status', '==', 'published')
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToBlogPost(d.id, d.data() as Record<string, unknown>);
}

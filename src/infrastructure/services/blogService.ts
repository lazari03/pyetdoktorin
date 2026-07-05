import { backendFetch } from '@/network/backendClient';
import type { BlogPost, CreateBlogPostPayload, UpdateBlogPostPayload } from '@/domain/entities/BlogPost';
import { slugify } from '@/domain/rules/slugify';

export { slugify };


export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const response = await backendFetch<{ items: BlogPost[] }>('/api/blog');
  return response.items;
}

export async function createBlogPost(payload: CreateBlogPostPayload): Promise<string> {
  const response = await backendFetch<BlogPost>('/api/blog', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      slug: payload.slug || slugify(payload.title),
    }),
  });
  return response.id;
}

export async function updateBlogPost(id: string, payload: UpdateBlogPostPayload): Promise<void> {
  await backendFetch(`/api/blog/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      ...payload,
      ...(payload.slug ? { slug: payload.slug } : {}),
    }),
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await backendFetch(`/api/blog/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tag: string;
  status: BlogStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type CreateBlogPostPayload = Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBlogPostPayload = Partial<Omit<BlogPost, 'id' | 'createdAt'>>;

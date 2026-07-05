import type { BlogPost, CreateBlogPostPayload, UpdateBlogPostPayload } from '@/domain/entities/BlogPost';

export interface IBlogService {
  getAll(): Promise<BlogPost[]>;
  create(payload: CreateBlogPostPayload): Promise<string>;
  update(id: string, payload: UpdateBlogPostPayload): Promise<void>;
  delete(id: string): Promise<void>;
}
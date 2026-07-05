import type { IBlogService } from '@/application/ports/IBlogService';
import type { BlogPost, CreateBlogPostPayload, UpdateBlogPostPayload } from '@/domain/entities/BlogPost';
import { getAllBlogPosts, createBlogPost, updateBlogPost, deleteBlogPost } from '@/infrastructure/services/blogService';

export class BlogServiceAdapter implements IBlogService {
  async getAll(): Promise<BlogPost[]> {
    return getAllBlogPosts();
  }

  async create(payload: CreateBlogPostPayload): Promise<string> {
    return createBlogPost(payload);
  }

  async update(id: string, payload: UpdateBlogPostPayload): Promise<void> {
    await updateBlogPost(id, payload);
  }

  async delete(id: string): Promise<void> {
    await deleteBlogPost(id);
  }
}
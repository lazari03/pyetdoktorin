import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import {
  buildCreateBlogPostPayload,
  buildUpdateBlogPostPayload,
  slugifyBlogTitle,
  type BlogPatchInput,
  type BlogStatus,
  type BlogWriteInput,
} from '@/services/blogPayloads';

export {
  buildCreateBlogPostPayload,
  buildUpdateBlogPostPayload,
  slugifyBlogTitle,
};
export type {
  BlogPatchInput,
  BlogStatus,
  BlogWriteInput,
};

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

const COLLECTION = 'blog';

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

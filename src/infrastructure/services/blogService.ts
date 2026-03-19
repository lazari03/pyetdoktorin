import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/config/firebaseconfig';
import { FirestoreCollections } from '@/config/FirestoreCollections';
import type { BlogPost, CreateBlogPostPayload, UpdateBlogPostPayload } from '@/domain/entities/BlogPost';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

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

export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
  const q = query(
    collection(db, FirestoreCollections.Blog),
    where('status', '==', 'published'),
    orderBy('publishedAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToBlogPost(d.id, d.data() as Record<string, unknown>));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const q = query(
    collection(db, FirestoreCollections.Blog),
    where('slug', '==', slug),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return docToBlogPost(d.id, d.data() as Record<string, unknown>);
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const q = query(
    collection(db, FirestoreCollections.Blog),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToBlogPost(d.id, d.data() as Record<string, unknown>));
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const snap = await getDoc(doc(db, FirestoreCollections.Blog, id));
  if (!snap.exists()) return null;
  return docToBlogPost(snap.id, snap.data() as Record<string, unknown>);
}

export async function createBlogPost(payload: CreateBlogPostPayload): Promise<string> {
  const now = new Date().toISOString();
  const slug = payload.slug || slugify(payload.title);
  const ref = await addDoc(collection(db, FirestoreCollections.Blog), {
    ...payload,
    slug,
    createdAt: now,
    updatedAt: now,
    publishedAt: payload.status === 'published' ? now : null,
  });
  return ref.id;
}

export async function updateBlogPost(id: string, payload: UpdateBlogPostPayload): Promise<void> {
  const now = new Date().toISOString();
  const ref = doc(db, FirestoreCollections.Blog, id);
  const existing = await getDoc(ref);
  const existingData = existing.data() as Record<string, unknown> | undefined;
  const wasPublished = existingData?.status === 'published';
  const isPublishing = payload.status === 'published' && !wasPublished;
  await updateDoc(ref, {
    ...payload,
    updatedAt: now,
    ...(isPublishing ? { publishedAt: now } : {}),
  });
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(db, FirestoreCollections.Blog, id));
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "@i18n";
import DashboardShell from "@/app/components/DashboardShell";
import { ToastProvider } from "../components/ToastProvider";
import { Button } from "@/presentation/ui/Button";
import { Input } from "@/presentation/ui/Input";
import { Textarea } from "@/presentation/ui/Textarea";
import { ADMIN_PATHS } from "@/navigation/paths";
import RequestStateGate from "@/presentation/components/RequestStateGate/RequestStateGate";
import type { BlogPost } from "@/domain/entities/BlogPost";
import {
  getAllBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  slugify,
} from "@/infrastructure/services/blogService";

type EditorMode = "list" | "create" | "edit";

const TAGS = [
  "Këshilla Shëndetësore",
  "Sëmundje Kronike",
  "Teknologji Shëndetësore",
  "Mendësi & Psikologji",
  "Ushqyerje",
  "Aktivitet Fizik",
  "Lajme",
];

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  tag: TAGS[0],
  status: "draft" as BlogPost["status"],
  author: "Ekipi i Pyet Doktorin",
};

export default function AdminBlogPage() {
  const { t } = useTranslation();

  const [mode, setMode] = useState<EditorMode>("list");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBlogPosts();
      setPosts(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, retryKey]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setMode("create");
  }

  function openEdit(post: BlogPost) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      tag: post.tag,
      status: post.status,
      author: post.author,
    });
    setEditingId(post.id);
    setMode("edit");
  }

  function handleTitleChange(title: string) {
    setForm((f) => ({
      ...f,
      title,
      slug: mode === "create" ? slugify(title) : f.slug,
    }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) return;
    setSaving(true);
    try {
      if (mode === "create") {
        await createBlogPost({ ...form, slug: form.slug || slugify(form.title) });
      } else if (mode === "edit" && editingId) {
        await updateBlogPost(editingId, form);
      }
      await load();
      setMode("list");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    try {
      await deleteBlogPost(id);
      await load();
    } finally {
      setDeleting(null);
    }
  }

  if (mode === "create" || mode === "edit") {
    return (
      <ToastProvider>
        <DashboardShell>
          <div className="p-4 md:p-6 space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
                  Blog
                </p>
                <h1 className="text-2xl font-bold text-gray-900">
                  {mode === "create" ? "New Article" : "Edit Article"}
                </h1>
              </div>
              <Button variant="outline" onClick={() => setMode("list")}>
                ← Back
              </Button>
            </div>

            {/* Form */}
            <div className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-5">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Si të Zgjidhni Mjekun e Duhur..."
                  className="w-full"
                />
              </div>

              {/* Slug */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Slug <span className="text-gray-400 font-normal">(URL)</span>
                </label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="si-te-zgjidhni-mjekun"
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  pyetdoktorin.al/blog/{form.slug || "slug-here"}
                </p>
              </div>

              {/* Tag + Status row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select
                    className="select select-bordered w-full"
                    value={form.tag}
                    onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
                  >
                    {TAGS.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="select select-bordered w-full"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as BlogPost["status"] }))
                    }
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              {/* Author */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Author</label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                  placeholder="Ekipi i Pyet Doktorin"
                  className="w-full"
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Excerpt *{" "}
                  <span className="text-gray-400 font-normal">
                    (shown on blog list + Google)
                  </span>
                </label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  placeholder="Udhëzues praktik për të gjetur mjekun..."
                  rows={3}
                  className="w-full"
                />
              </div>

              {/* Content */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Content *
                </label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  placeholder="Write the full article here..."
                  rows={16}
                  className="w-full font-mono text-sm"
                />
                <p className="text-xs text-gray-400">
                  Tip: separate paragraphs with a blank line.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="primary"
                  loading={saving}
                  onClick={handleSave}
                  disabled={!form.title.trim() || !form.excerpt.trim() || !form.content.trim()}
                >
                  {form.status === "published" ? "Publish" : "Save Draft"}
                </Button>
                <Button variant="outline" onClick={() => setMode("list")} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </DashboardShell>
      </ToastProvider>
    );
  }

  // ─── List view ──────────────────────────────────────────────────────────
  return (
    <ToastProvider>
      <DashboardShell>
        <RequestStateGate
          loading={loading && posts.length === 0}
          error={error}
          onRetry={() => setRetryKey((k) => k + 1)}
          homeHref={ADMIN_PATHS.root}
          loadingLabel={t("loading")}
          analyticsPrefix="admin.blog"
        >
          <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
                    Content
                  </p>
                  <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage articles — published posts appear on the website and are indexed by Google.
                  </p>
                </div>
                <Button variant="primary" onClick={openCreate}>
                  + New Article
                </Button>
              </div>
            </section>

            {/* Stats strip */}
            <section className="grid grid-cols-3 gap-4">
              {[
                { label: "Total", value: posts.length },
                { label: "Published", value: posts.filter((p) => p.status === "published").length },
                { label: "Drafts", value: posts.filter((p) => p.status === "draft").length },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white rounded-2xl shadow-md border border-purple-50 p-5"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500">{s.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
                </div>
              ))}
            </section>

            {/* Posts list */}
            <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-3">
              {posts.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-10 text-center">
                  <p className="text-gray-500 text-sm">No articles yet.</p>
                  <Button variant="outline" className="mt-4" onClick={openCreate}>
                    Write your first article
                  </Button>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className="group rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {post.status}
                        </span>
                        <span className="text-[11px] text-purple-600 font-semibold uppercase tracking-wider">
                          {post.tag}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mt-1 truncate">
                        {post.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{post.excerpt}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        /blog/{post.slug} · {post.author}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="xs" variant="outline" onClick={() => openEdit(post)}>
                        Edit
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        loading={deleting === post.id}
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </RequestStateGate>
      </DashboardShell>
    </ToastProvider>
  );
}

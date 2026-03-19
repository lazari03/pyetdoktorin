import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import SeoHead from "@/presentation/components/seo/SeoHead";
import Link from "next/link";
import {
  buildMetadata,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "@/app/seo";
import { getBlogPostBySlugServer as getBlogPostBySlug,
  getPublishedBlogPostsServer as getPublishedBlogPosts,
} from "@/infrastructure/services/blogServiceServer";

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts().catch(() => []);
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug).catch(() => null);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.updatedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Pyet Doktorin",
      url: "https://pyetdoktorin.al",
    },
  };

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("sq-AL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    : "";

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          articleSchema,
          buildMedicalWebPageSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${post.slug}`,
          }),
          buildBreadcrumbSchema([
            { name: "Kryefaqja", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />

      <WebsiteSection>
        <div className="website-container max-w-3xl mx-auto">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-purple-600 font-semibold mb-6 hover:underline"
          >
            ← Kthehu te Blog
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap text-sm text-slate-500 mb-4">
            <span className="font-semibold text-purple-600 uppercase tracking-wider text-xs">
              {post.tag}
            </span>
            <span>·</span>
            {formattedDate && <time dateTime={post.publishedAt}>{formattedDate}</time>}
            <span>·</span>
            <span>{post.author}</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-lg text-slate-600 mb-8 border-l-4 border-purple-300 pl-4 italic">
            {post.excerpt}
          </p>

          {/* Content */}
          <div className="prose prose-slate max-w-none space-y-4">
            {post.content
              .split(/\n\n+/)
              .map((para, i) => {
                const trimmed = para.trim();
                return trimmed ? (
                  <p key={i} className="text-slate-700 leading-relaxed">
                    {trimmed}
                  </p>
                ) : null;
              })}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title="Rezervo Vizitë me Mjek Sot"
            subtitle="Platforma nr.1 shqiptare për takime mjekësore online."
            primary={{ label: "Fillo Tani", href: "/register" }}
            secondary={{ label: "Mëso Më Shumë", href: "/individuals" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}

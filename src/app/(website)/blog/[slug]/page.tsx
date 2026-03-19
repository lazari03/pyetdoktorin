import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import SeoHead from "@/presentation/components/seo/SeoHead";
import { buildMetadata, buildBreadcrumbSchema, buildMedicalWebPageSchema } from "@/app/seo";

// ─── Blog post data ────────────────────────────────────────────────────────
// Replace with a real CMS/Firebase fetch when ready.
// Each article is its own Google-indexable URL with unique metadata.

const POSTS: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    tag: string;
    date: string;
    publishedAt: string; // ISO 8601
    author: string;
    keywords: string[];
  }
> = {
  "si-te-zgjidhni-mjekun-e-duhur": {
    title: "Si të Zgjidhni Mjekun e Duhur për Ju",
    excerpt:
      "Udhëzues praktik për të gjetur mjekun specialist më të përshtatshëm sipas nevojave tuaja shëndetësore.",
    content: `
      Gjetja e mjekut të duhur është një nga vendimet më të rëndësishme për shëndetin tuaj.
      Merrni parasysh specializimin, përvojën, vendndodhjen dhe disponueshmërinë.
      Me Pyet Doktorin, mund të shikoni profilet e mjekëve, vlerësimet e pacientëve dhe të rezervoni online.
    `,
    tag: "Këshilla Shëndetësore",
    date: "15 Mars 2026",
    publishedAt: "2026-03-15T08:00:00Z",
    author: "Ekipi i Pyet Doktorin",
    keywords: ["si të zgjidhni mjekun", "mjek specialist", "këshilla shëndetësore"],
  },
  "simptomat-e-diabetit": {
    title: "Simptomat e Diabetit që Nuk Duhet t'i Injoroni",
    excerpt:
      "Diabeti është një nga sëmundjet më të përparuara në Shqipëri. Mësoni simptomat kryesore dhe kur të konsultoheni me mjekun.",
    content: `
      Diabeti tip 2 po rritet me shpejtësi në Shqipëri. Simptomat kryesore përfshijnë: etje të tepruar,
      urinim të shpeshtë, lodhje, vizion të paqartë dhe shërimin e ngadaltë të plagëve.
      Nëse keni këto simptoma, konsultohuni me endokrinologun tonë online.
    `,
    tag: "Sëmundje Kronike",
    date: "10 Mars 2026",
    publishedAt: "2026-03-10T08:00:00Z",
    author: "Ekipi i Pyet Doktorin",
    keywords: ["simptomat e diabetit", "diabet shqipëri", "endokrinolog online"],
  },
  "receta-elektronike-shqiperi": {
    title: "Receta Elektronike: E Ardhmja e Barnave në Shqipëri",
    excerpt:
      "Si funksionon receta elektronike dhe si mund ta marrësh nga mjeku yt online pa dalë nga shtëpia.",
    content: `
      Receta elektronike është inovacioni më i madh shëndetësor i viteve të fundit.
      Nëpërmjet Pyet Doktorin, mjeku yt mund të lëshojë recetën direkt online,
      dhe ti mund ta marrësh çdo ilaç në farmaci pa nevojë për vizitë fizike.
    `,
    tag: "Teknologji Shëndetësore",
    date: "5 Mars 2026",
    publishedAt: "2026-03-05T08:00:00Z",
    author: "Ekipi i Pyet Doktorin",
    keywords: ["recetë elektronike", "recetë online shqipëri", "ilaçe online"],
  },
};

export function generateStaticParams() {
  return Object.keys(POSTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) return {};
  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${slug}`,
    keywords: post.keywords,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = POSTS[slug];
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author },
    publisher: {
      "@type": "Organization",
      name: "Pyet Doktorin",
      url: "https://pyetdoktorin.al",
    },
  };

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          articleSchema,
          buildMedicalWebPageSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${slug}`,
            keywords: post.keywords,
          }),
          buildBreadcrumbSchema([
            { name: "Kryefaqja", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${slug}` },
          ]),
        ]}
      />

      <WebsiteSection>
        <div className="website-container max-w-3xl mx-auto">
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-500">
            <span className="font-semibold text-purple-600 uppercase tracking-wider text-xs">
              {post.tag}
            </span>
            <span>·</span>
            <time dateTime={post.publishedAt}>{post.date}</time>
            <span>·</span>
            <span>{post.author}</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
          <p className="text-lg text-slate-600 mb-8">{post.excerpt}</p>

          <div className="prose prose-slate max-w-none">
            {post.content.split("\n").map((para, i) => {
              const trimmed = para.trim();
              return trimmed ? <p key={i}>{trimmed}</p> : null;
            })}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}

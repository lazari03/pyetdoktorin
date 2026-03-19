import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import SeoHead from "@/presentation/components/seo/SeoHead";
import {
  buildMetadata,
  buildMedicalWebPageSchema,
  buildBreadcrumbSchema,
} from "@/app/seo";

const CITIES: Record<
  string,
  {
    label: string;
    region: string;
    description: string;
  }
> = {
  tirane: {
    label: "Tiranë",
    region: "Tiranë",
    description:
      "Gjej mjekë specialistë në Tiranë dhe rezervo vizitë online. Qasje e shpejtë te kujdesi shëndetësor privat në kryeqytet.",
  },
  durres: {
    label: "Durrës",
    region: "Durrës",
    description:
      "Mjekë specialistë në Durrës. Rezervo vizitën tënde online dhe shpëto nga radhët e gjata.",
  },
  vlore: {
    label: "Vlorë",
    region: "Vlorë",
    description:
      "Gjej dhe rezervo mjekë specialistë në Vlorë. Kujdes shëndetësor cilësor, lehtësisht i aksesueshëm.",
  },
  shkoder: {
    label: "Shkodër",
    region: "Shkodër",
    description:
      "Mjekë specialistë në Shkodër. Konsultë online ose me takim fizik, sipas preferencës sate.",
  },
  elbasan: {
    label: "Elbasan",
    region: "Elbasan",
    description:
      "Gjej mjekë specialistë në Elbasan dhe rezervo vizitë online. Shërbim i shpejtë dhe profesional.",
  },
  fier: {
    label: "Fier",
    region: "Fier",
    description:
      "Mjekë specialistë në Fier. Rezervo vizitën tënde online dhe merr kujdes shëndetësor cilësor.",
  },
  korce: {
    label: "Korçë",
    region: "Korçë",
    description:
      "Gjej dhe rezervo mjekë specialistë në Korçë. Kujdes shëndetësor privat, lehtësisht i aksesueshëm.",
  },
};

export function generateStaticParams() {
  return Object.keys(CITIES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) return {};
  return buildMetadata({
    title: `Mjekë në ${city.label} | Pyet Doktorin`,
    description: city.description,
    path: `/qytetet/${slug}`,
    keywords: [
      `mjek ${city.label.toLowerCase()}`,
      `mjek specialist ${city.label.toLowerCase()}`,
      `klinikë ${city.label.toLowerCase()}`,
      `rezervo vizitë mjeku ${city.label.toLowerCase()}`,
      "mjek online shqipëri",
    ],
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const city = CITIES[slug];
  if (!city) notFound();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildMedicalWebPageSchema({
            title: `Mjekë në ${city.label}`,
            description: city.description,
            path: `/qytetet/${slug}`,
          }),
          buildBreadcrumbSchema([
            { name: "Kryefaqja", path: "/" },
            { name: "Qytetet", path: "/qytetet" },
            { name: city.label, path: `/qytetet/${slug}` },
          ]),
        ]}
      />

      <WebsiteHero
        eyebrow={city.region}
        title={`Mjekë Specialistë në ${city.label}`}
        subtitle={city.description}
        primaryCta={{ label: "Gjej Mjekun Tënd", href: "/individuals" }}
        secondaryCta={{ label: "Si Funksionon?", href: "/si-funksionon" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={`Mjekë në ${city.label}`}
      />

      <WebsiteSection>
        <div className="website-container">
          <h2 className="website-section-title">
            Pse Pyet Doktorin në {city.label}?
          </h2>
          <p className="website-section-body">
            Platforma jonë lidh pacientët në {city.label} me mjekët specialistë
            më të mirë. Rezervo online, paguaj vetëm pasi mjeku pranon vizitën,
            dhe merr kujdes shëndetësor cilësor pa radhë.
          </p>
        </div>
      </WebsiteSection>

      <WebsiteCta />
    </WebsiteShell>
  );
}

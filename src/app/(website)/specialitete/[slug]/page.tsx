import { notFound } from "next/navigation";
import type { Metadata } from "next";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import SeoHead from "@/presentation/components/seo/SeoHead";
import {
  buildMetadata,
  buildSpecialtyPageSchema,
  buildBreadcrumbSchema,
  buildFaqSchema,
} from "@/app/seo";

// ─── Specialty data ────────────────────────────────────────────────────────
// Extend this list as you add more specialists to the platform

const SPECIALTIES: Record<
  string,
  {
    label: string;
    description: string;
    heroTitle: string;
    heroSubtitle: string;
    faqs: Array<{ question: string; answer: string }>;
  }
> = {
  kardiologji: {
    label: "Kardiologji",
    description:
      "Gjej kardiologë të specializuar në Shqipëri dhe rezervo vizitën tënde online. Kujdes kardiovaskular profesional.",
    heroTitle: "Kardiologë Online",
    heroSubtitle:
      "Rezervo vizitë me kardiolog specialist. Kujdes për zemrën tënde nga koha e duhur.",
    faqs: [
      {
        question: "Si mund të rezervoj vizitë me kardiolog?",
        answer:
          "Regjistrohu në Pyet Doktorin, kërko kardiologë të disponueshëm dhe zgjidh orarin që të përshtatet.",
      },
      {
        question: "Sa kushton konsulta me kardiolog?",
        answer:
          "Çmimi ndryshon sipas mjekut. Mund ta shikosh tarifën e plotë para se të rezervosh.",
      },
    ],
  },
  pediatri: {
    label: "Pediatri",
    description:
      "Gjej pediatra të kualifikuar në Shqipëri për kujdesin shëndetësor të fëmijëve tuaj.",
    heroTitle: "Pediatra Online",
    heroSubtitle:
      "Kujdes profesional për fëmijën tënd. Rezervo vizitë me pediatër tani.",
    faqs: [
      {
        question: "A mund të konsultohem me pediatër për foshnjën time?",
        answer:
          "Po, pediatrat tanë janë të specializuar për të gjitha grupmoshat, duke filluar nga të porsalindurit.",
      },
    ],
  },
  dermatologji: {
    label: "Dermatologji",
    description:
      "Dermatologë specialist në Shqipëri. Rezervo vizitë online për probleme të lëkurës, flokëve dhe thonjve.",
    heroTitle: "Dermatologë Online",
    heroSubtitle:
      "Trajto problemet e lëkurës me ndihmën e dermatologëve specialistë.",
    faqs: [
      {
        question: "A mund të dërgoj foto për diagnozë online?",
        answer:
          "Po, dermatologët mund të vlerësojnë gjendjen e lëkurës bazuar në foto që dërgon gjatë konsultës.",
      },
    ],
  },
  neurologji: {
    label: "Neurologji",
    description:
      "Neurologë specialistë në Shqipëri. Konsultë online për probleme neurologjike, migrenë, dhe çrregullime të sistemit nervor.",
    heroTitle: "Neurologë Online",
    heroSubtitle: "Kujdes neurologjik profesional. Rezervo vizitën tënde sot.",
    faqs: [
      {
        question: "Kur duhet të shkoj te neurologu?",
        answer:
          "Nëse ke migrenë të shpeshta, mpirje, dobësi muskulore ose probleme me kujtesën, konsultohu me neurologun tonë.",
      },
    ],
  },
  psikologji: {
    label: "Psikologji",
    description:
      "Psikologë dhe terapistë online në Shqipëri. Kujdes për shëndetin mendor në mënyrë konfidenciale.",
    heroTitle: "Psikologë Online",
    heroSubtitle:
      "Mbështetje për shëndetin tënd mendor. Konfidenciale dhe e aksesueshme.",
    faqs: [
      {
        question: "A janë seancat me psikolog konfidenciale?",
        answer:
          "Po, të gjitha seancat janë plotësisht konfidenciale dhe të mbrojtura nga ligji.",
      },
    ],
  },
  gjinekologji: {
    label: "Gjinekologji",
    description:
      "Gjinekologë specialistë online në Shqipëri. Kujdes gjinekologjik dhe obstetrik profesional.",
    heroTitle: "Gjinekologë Online",
    heroSubtitle: "Kujdes gjinekologjik profesional dhe konfidencial.",
    faqs: [
      {
        question: "A mund të bëj kontroll gjinekologjik online?",
        answer:
          "Gjinekologët mund të ofrojnë konsultë online për shumë pyetje dhe simptoma. Disa ekzaminime kërkojnë vizitë fizike.",
      },
    ],
  },
  ortopedi: {
    label: "Ortopedi",
    description:
      "Ortopedë specialistë online në Shqipëri. Konsultë për probleme të kockave, nyjeve dhe muskujve.",
    heroTitle: "Ortopedë Online",
    heroSubtitle:
      "Kujdes ortopedik profesional për lëvizje të lirë dhe pa dhimbje.",
    faqs: [
      {
        question: "Kur duhet të shkoj te ortopedi?",
        answer:
          "Nëse ke dhimbje kyçesh, kockash ose pas lëndimit, ortopedu mund të vlerësojë gjendjen dhe të rekomandojë trajtim.",
      },
    ],
  },
  endokrinologji: {
    label: "Endokrinologji",
    description:
      "Endokrinologë specialistë online për diabet, tiroide dhe çrregullime hormonale në Shqipëri.",
    heroTitle: "Endokrinologë Online",
    heroSubtitle:
      "Menaxho diabetin, tirioiden dhe çrregullimet hormonale me specialistë.",
    faqs: [
      {
        question: "A mund të menaxhoj diabetin me konsultë online?",
        answer:
          "Po, endokrinologët mund të ndihmojnë me menaxhimin e diabetit, duke përfshirë rregullimin e medikamenteve dhe rekomandime diete.",
      },
    ],
  },
};

// ─── Static params for build-time generation ───────────────────────────────

export function generateStaticParams() {
  return Object.keys(SPECIALTIES).map((slug) => ({ slug }));
}

// ─── Per-page metadata ─────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const specialty = SPECIALTIES[slug];
  if (!specialty) return {};
  return buildMetadata({
    title: `${specialty.label} Online | Pyet Doktorin`,
    description: specialty.description,
    path: `/specialitete/${slug}`,
    keywords: [
      `${specialty.label.toLowerCase()} shqipëri`,
      `${specialty.label.toLowerCase()} online`,
      `${specialty.label.toLowerCase()} tiranë`,
      "mjek specialist online",
      "rezervo vizitë mjeku",
    ],
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const specialty = SPECIALTIES[slug];
  if (!specialty) notFound();

  return (
    <WebsiteShell>
      <SeoHead
        schema={[
          buildSpecialtyPageSchema({
            specialty: specialty.label,
            description: specialty.description,
            path: `/specialitete/${slug}`,
          }),
          buildBreadcrumbSchema([
            { name: "Kryefaqja", path: "/" },
            { name: "Specialitete", path: "/specialitete" },
            { name: specialty.label, path: `/specialitete/${slug}` },
          ]),
          buildFaqSchema(specialty.faqs),
        ]}
      />

      <WebsiteHero
        eyebrow="Specialitet"
        title={specialty.heroTitle}
        subtitle={specialty.heroSubtitle}
        primaryCta={{ label: "Rezervo Tani", href: "/register" }}
        secondaryCta={{ label: "Shiko Mjekët", href: "/individuals" }}
        imageSrc="/api/images?key=hero1"
        imageAlt={specialty.label}
      />

      <WebsiteSection>
        <div className="website-container">
          <h2 className="website-section-title">
            Pse të zgjidhni {specialty.label} Online?
          </h2>
          <p className="website-section-body">{specialty.description}</p>
        </div>
      </WebsiteSection>

      {/* FAQ Section */}
      <WebsiteSection>
        <div className="website-container">
          <h2 className="website-section-title">Pyetje të Shpeshta</h2>
          <div className="mt-8 space-y-6">
            {specialty.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border p-6">
                <h3 className="font-semibold text-lg">{faq.question}</h3>
                <p className="mt-2 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteCta
        title={`Rezervo Vizitë me ${specialty.label}`}
        subtitle={specialty.description}
        primary={{ label: "Fillo Tani", href: "/register" }}
        secondary={{ label: "Mëso Më Shumë", href: "/individuals" }}
      />
    </WebsiteShell>
  );
}

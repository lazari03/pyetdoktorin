import Link from "next/link";
import WebsiteShell from "@/presentation/components/website/WebsiteShell";
import WebsiteHero from "@/presentation/components/website/WebsiteHero";
import WebsiteSection from "@/presentation/components/website/WebsiteSection";
import WebsiteCta from "@/presentation/components/website/WebsiteCta";
import { buildMetadata, SEO_KEYWORDS_AL } from "@/app/seo";
import { getRequestLocale, getServerTranslations, type Locale } from "@/i18n/serverTranslations";

type Section = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  note?: string;
};

type ReferenceLink = {
  label: string;
  href: string;
  note: string;
};

type Copy = {
  metadataTitle: string;
  metadataDescription: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  heroPrimary: string;
  heroSecondary: string;
  sectionEyebrow: string;
  sectionTitle: string;
  sectionSubtitle: string;
  legalNoticeTitle: string;
  legalNoticeBody: string;
  effectiveDateLabel: string;
  effectiveDateValue: string;
  controllerTitle: string;
  controllerRows: Array<{ label: string; value: string }>;
  sections: Section[];
  referencesTitle: string;
  referencesBody: string;
  references: ReferenceLink[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};

function getCopy(locale: Locale, companyName: string): Copy {
  if (locale === "en") {
    return {
      metadataTitle: "Privacy Policy | Pyet Doktorin",
      metadataDescription:
        "How Pyet Doktorin collects, stores, and protects personal and health data on its video-consultation and payment platform, and the rights users hold under Albanian law.",
      eyebrow: "Legal",
      title: "Privacy Policy",
      subtitle:
        "Pyet Doktorin processes account and health-related data only to run the platform. This page explains what we collect, why, who we share it with, and the rights Albanian data-protection law gives you over it.",
      heroPrimary: "Contact legal support",
      heroSecondary: "View terms",
      sectionEyebrow: "Albanian-law framework",
      sectionTitle: "How your data is handled on Pyet Doktorin",
      sectionSubtitle:
        "This page sets out what personal and health data we process, the legal basis for each use, the outside services involved, and how to exercise your rights.",
      legalNoticeTitle: "Important legal notice",
      legalNoticeBody:
        "This policy is designed to align with Law No. 124/2024 on the Protection of Personal Data. Pyet Doktorin acts as data controller for account and platform-usage data; the independent doctor a patient consults is separately responsible, as a healthcare professional, for the clinical records they create.",
      effectiveDateLabel: "Last updated",
      effectiveDateValue: "13 July 2026",
      controllerTitle: "Data controller details",
      controllerRows: [
        { label: "Controller", value: companyName },
        { label: "Website", value: "https://pyetdoktorin.al" },
        { label: "Email", value: "info@pyetdoktorin.al" },
        { label: "Registered office", value: "[complete before publication]" },
        { label: "NUIS / tax number", value: "[complete before publication]" },
      ],
      sections: [
        {
          title: "1. Scope",
          paragraphs: [
            "This policy covers personal data processed through the Pyet Doktorin website, dashboard, booking flows, messaging, video-consultation technology, and payment processing.",
            "It applies to patients, doctors, pharmacies, clinics and admin users of the platform. It does not cover the internal record-keeping practices of an independent doctor or clinic once data leaves the platform (for example, a paper file they keep at their own practice).",
          ],
        },
        {
          title: "2. What data we collect",
          paragraphs: [
            "Account data: name, surname, email, phone number, address and country, and — for doctors — professional specialization, consultation fee and a submitted signature used on prescriptions.",
            "Health-related data created through use of the platform: appointment bookings, video-consultation metadata, and electronic prescriptions, including medicines, dosage and doctor notes.",
            "Payment data: consultation fees are processed by our payment provider; Pyet Doktorin does not see or store card numbers.",
          ],
          bullets: [
            "Your password is stored as a salted hash and is never visible to us, even to staff.",
            "Notification and activity records are kept for a rolling 30-day window, then archived automatically.",
            "We do not collect more account information than the fields above; we do not buy data from third parties.",
          ],
        },
        {
          title: "3. Why we process it (legal basis)",
          paragraphs: [
            "Booking, video-consultation and payment data are processed to perform the contract between you and the platform — you cannot book or pay for a consultation without them.",
            "Security logs, session cookies and fraud-prevention checks are processed under our legitimate interest in keeping the platform and its users safe.",
            "Marketing or usage-analytics cookies are processed only with your consent, given through the cookie banner, and you may withdraw that consent at any time.",
          ],
        },
        {
          title: "4. Who we share it with",
          paragraphs: [
            "We do not sell personal data. Data is shared only with the processors needed to run the service, each acting under our instructions:",
          ],
          bullets: [
            "Google Firebase — authentication, database and file storage, encrypted in transit and at rest.",
            "DigitalOcean Spaces — storage for uploaded files such as profile pictures.",
            "100ms — video-consultation infrastructure for the call itself.",
            "Brevo — transactional email delivery (e.g. account and appointment notifications).",
            "Vonage — SMS delivery where phone verification or alerts are used.",
            "Google reCAPTCHA and Google Analytics — abuse prevention and, only with consent, aggregate usage analytics.",
            "Our payment provider — checkout and payment processing for consultation fees.",
          ],
          note: "The independent doctor you consult receives the health information needed to provide that consultation. They are separately responsible, as a healthcare professional, for how they handle it under Albanian healthcare law.",
        },
        {
          title: "5. How your data is stored and secured",
          paragraphs: [
            "Data is stored in an encrypted environment (Google Firebase), encrypted both in transit and at rest. Access is restricted by role: only you and the healthcare professionals involved in your care can see your medical information.",
            "All traffic is encrypted with TLS. Sign-in uses short-lived, httpOnly session cookies and signed tokens; sessions end automatically after 30 minutes of inactivity, and security-relevant events are logged for audit purposes.",
          ],
          bullets: [
            "No system is completely immune to risk, but we design defensively and monitor for misuse.",
            "Suspected security incidents can be reported to info@pyetdoktorin.al.",
          ],
        },
        {
          title: "6. Cookies",
          paragraphs: [
            "We use strictly necessary session cookies to keep you signed in — inaccessible to scripts (httpOnly) — and a cookie that remembers your language preference. Neither requires consent under Albanian law, as both are essential to the service you asked for.",
            "Optional analytics cookies are set only if you accept them in the cookie banner, and you can withdraw that consent at any time without affecting your ability to use the platform.",
          ],
        },
        {
          title: "7. Your rights",
          paragraphs: [
            "Under Law No. 124/2024, you may request access to, correction of, or deletion of your personal data, and may object to or request restriction of certain processing, subject to the conditions the law sets for each right.",
          ],
          bullets: [
            "Requests can be sent to info@pyetdoktorin.al; we will respond within a reasonable period.",
            "You may also complain directly to Albania's Commissioner for the Right to Information and the Protection of Personal Data.",
            "Deleting data tied to an active medical record may be limited where Albanian healthcare record-keeping law requires retention.",
          ],
        },
        {
          title: "8. Children's data",
          paragraphs: [
            "The platform is not directed at children. Where Albanian law requires parental or guardian involvement, a minor may only be registered or assisted through a parent or lawful guardian's account.",
          ],
        },
        {
          title: "9. Changes to this policy",
          paragraphs: [
            "We may update this policy as the service, law, or subprocessors change. Material changes are published on this page with an updated revision date and, where appropriate, communicated to registered users before they take effect.",
          ],
        },
      ],
      referencesTitle: "Legal basis used for this policy",
      referencesBody:
        "This policy is written against the personal-data and healthcare-record laws that apply to Pyet Doktorin as data controller and to the independent doctors who use the platform.",
      references: [
        {
          label: "Law No. 124/2024 on the Protection of Personal Data",
          href: "https://idp.al/en/about-us/",
          note: "Official IDP page confirming the Commissioner's competences under Law No. 124/2024.",
        },
        {
          label: "Law No. 10107, dated 30.03.2009, on Healthcare in the Republic of Albania",
          href: "https://qbz.gov.al/eli/ligj/2009/03/30/10107",
          note: "Official legal reference URL on QBZ — governs the record-keeping duties of doctors using the platform.",
        },
      ],
      ctaTitle: "Have a question about your data?",
      ctaSubtitle:
        "Reach out before you book, or at any time afterward — requests about access, correction or deletion are handled by the same team that reviews the terms of service.",
      ctaPrimary: "Contact the team",
      ctaSecondary: "View terms of service",
    };
  }

  return {
    metadataTitle: "Politika e Privatësisë | Pyet Doktorin",
    metadataDescription:
      "Si mbledh, ruan dhe mbron Pyet Doktorin të dhënat personale dhe shëndetësore në platformën e saj të video-konsultimit dhe pagesave, dhe të drejtat që keni sipas ligjit shqiptar.",
    eyebrow: "Juridike",
    title: "Politika e Privatësisë",
    subtitle:
      "Pyet Doktorin përpunon të dhënat e llogarisë dhe ato shëndetësore vetëm për të mundësuar platformën. Kjo faqe shpjegon çfarë mbledhim, pse, me kë e ndajmë dhe të drejtat që ju jep ligji shqiptar për mbrojtjen e të dhënave.",
    heroPrimary: "Kontaktoni mbështetjen ligjore",
    heroSecondary: "Shikoni kushtet",
    sectionEyebrow: "Kuadri ligjor shqiptar",
    sectionTitle: "Si trajtohen të dhënat tuaja në Pyet Doktorin",
    sectionSubtitle:
      "Kjo faqe përcakton çfarë të dhënash personale dhe shëndetësore përpunojmë, bazën ligjore për secilin përdorim, shërbimet e jashtme të përfshira dhe si të ushtroni të drejtat tuaja.",
    legalNoticeTitle: "Njoftim i rëndësishëm ligjor",
    legalNoticeBody:
      "Kjo politikë është hartuar për t'u përafruar me ligjin nr. 124/2024 “Për mbrojtjen e të dhënave personale”. Pyet Doktorin vepron si kontrollues i të dhënave për llogarinë dhe përdorimin e platformës; mjeku i pavarur që pacienti konsulton mban përgjegjësi të veçantë, si profesionist shëndetësor, për regjistrimet klinike që krijon.",
    effectiveDateLabel: "Përditësuar më",
    effectiveDateValue: "13 korrik 2026",
    controllerTitle: "Të dhënat e kontrolluesit të të dhënave",
    controllerRows: [
      { label: "Kontrolluesi", value: companyName },
      { label: "Faqja", value: "https://pyetdoktorin.al" },
      { label: "Email", value: "info@pyetdoktorin.al" },
      { label: "Selia e regjistruar", value: "[plotësojeni para publikimit]" },
      { label: "NUIS / NIPT", value: "[plotësojeni para publikimit]" },
    ],
    sections: [
      {
        title: "1. Fusha e zbatimit",
        paragraphs: [
          "Kjo politikë mbulon të dhënat personale të përpunuara përmes faqes Pyet Doktorin, panelit të përdoruesit, rrjedhave të rezervimit, komunikimit, teknologjisë së video-konsultimit dhe përpunimit të pagesave.",
          "Ajo zbatohet për pacientët, mjekët, farmacitë, klinikat dhe administratorët e platformës. Nuk mbulon praktikat e brendshme të regjistrimit të një mjeku ose klinike të pavarur pasi të dhënat dalin nga platforma (p.sh. një dosje letre që mbajnë në kabinetin e tyre).",
        ],
      },
      {
        title: "2. Çfarë të dhënash mbledhim",
        paragraphs: [
          "Të dhëna llogarie: emri, mbiemri, email-i, numri i telefonit, adresa dhe shteti, dhe — për mjekët — specializimi profesional, tarifa e konsultës dhe një nënshkrim i paraqitur që përdoret në receta.",
          "Të dhëna shëndetësore të krijuara nga përdorimi i platformës: rezervimet e takimeve, metadata e video-konsultave dhe recetat elektronike, përfshirë barnat, dozimin dhe shënimet e mjekut.",
          "Të dhëna pagese: tarifat e konsultës përpunohen nga ofruesi ynë i pagesave; Pyet Doktorin nuk i sheh dhe nuk i ruan numrat e kartës.",
        ],
        bullets: [
          "Fjalëkalimi juaj ruhet i enkriptuar (hash i kripur) dhe nuk është kurrë i dukshëm për ne, as për stafin.",
          "Njoftimet dhe regjistrat e aktivitetit ruhen për një periudhë rrotulluese 30-ditore, më pas arkivohen automatikisht.",
          "Nuk mbledhim më shumë të dhëna llogarie sesa fushat më sipër; nuk blejmë të dhëna nga palë të treta.",
        ],
      },
      {
        title: "3. Pse i përpunojmë (baza ligjore)",
        paragraphs: [
          "Të dhënat e rezervimit, video-konsultës dhe pagesës përpunohen për të zbatuar kontratën mes jush dhe platformës — pa to nuk mund të rezervoni apo paguani një konsultë.",
          "Regjistrat e sigurisë, cookie-t e sesionit dhe kontrollet kundër mashtrimit përpunohen për interesin tonë legjitim për të mbajtur platformën dhe përdoruesit e saj të sigurt.",
          "Cookie-t e marketingut ose analitikës përdoren vetëm me pëlqimin tuaj, dhënë përmes banerit të cookie-ve, dhe mund ta tërhiqni atë pëlqim në çdo kohë.",
        ],
      },
      {
        title: "4. Me kë i ndajmë",
        paragraphs: [
          "Ne nuk shesim të dhëna personale. Të dhënat ndahen vetëm me përpunuesit e nevojshëm për të mundësuar shërbimin, secili duke vepruar sipas udhëzimeve tona:",
        ],
        bullets: [
          "Google Firebase — vërtetimi, baza e të dhënave dhe ruajtja e skedarëve, e enkriptuar gjatë transmetimit dhe në ruajtje.",
          "DigitalOcean Spaces — ruajtja e skedarëve të ngarkuar, si fotot e profilit.",
          "100ms — infrastruktura e video-konsultës për vetë thirrjen.",
          "Brevo — dërgimi i email-eve transaksionale (p.sh. njoftime llogarie dhe takimesh).",
          "Vonage — dërgimi i SMS kur përdoret verifikimi me telefon ose alarmet.",
          "Google reCAPTCHA dhe Google Analytics — parandalimi i abuzimit dhe, vetëm me pëlqim, analitikë e agreguar përdorimi.",
          "Ofruesi ynë i pagesave — përpunimi i pagesave për tarifat e konsultës.",
        ],
        note: "Mjeku i pavarur që konsultoni merr informacionin shëndetësor të nevojshëm për të dhënë atë konsultë. Ai mban përgjegjësi të veçantë, si profesionist shëndetësor, për mënyrën si e trajton atë sipas ligjit shqiptar të kujdesit shëndetësor.",
      },
      {
        title: "5. Si ruhen dhe sigurohen të dhënat tuaja",
        paragraphs: [
          "Të dhënat ruhen në një mjedis të enkriptuar (Google Firebase), të enkriptuara gjatë transmetimit dhe në ruajtje. Qasja kufizohet sipas rolit: vetëm ju dhe profesionistët shëndetësorë të përfshirë në kujdesin tuaj mund të shohin informacionin tuaj mjekësor.",
          "I gjithë trafiku enkriptohet me TLS. Kyçja përdor cookie sesioni jetëshkurtër (httpOnly) dhe tokena të nënshkruar; sesionet mbyllen automatikisht pas 30 minutash pa aktivitet, dhe ngjarjet e rëndësishme për sigurinë regjistrohen për qëllime auditimi.",
        ],
        bullets: [
          "Asnjë sistem nuk është plotësisht imun ndaj rreziqeve, por ne projektojmë në mënyrë mbrojtëse dhe monitorojmë për keqpërdorim.",
          "Incidentet e mundshme të sigurisë mund të raportohen te info@pyetdoktorin.al.",
        ],
      },
      {
        title: "6. Skedarët Cookie",
        paragraphs: [
          "Ne përdorim cookie sesioni rreptësisht të nevojshme për t'ju mbajtur të kyçur — të paarritshme nga skriptet (httpOnly) — dhe një cookie që ruan gjuhën tuaj të preferuar. Asnjëra nuk kërkon pëlqim sipas ligjit shqiptar, pasi të dyja janë thelbësore për shërbimin që keni kërkuar.",
          "Cookie-t opsionale të analitikës vendosen vetëm nëse i pranoni në banerin e cookie-ve, dhe mund ta tërhiqni atë pëlqim në çdo kohë pa ndikuar në aftësinë tuaj për të përdorur platformën.",
        ],
      },
      {
        title: "7. Të drejtat tuaja",
        paragraphs: [
          "Sipas ligjit nr. 124/2024, ju mund të kërkoni akses, korrigjim ose fshirje të të dhënave tuaja personale, dhe mund të kundërshtoni ose kërkoni kufizim të përpunimit, sipas kushteve që ligji parashikon për secilën të drejtë.",
        ],
        bullets: [
          "Kërkesat mund të dërgohen te info@pyetdoktorin.al; do t'ju përgjigjemi brenda një afati të arsyeshëm.",
          "Mund të ankoheni gjithashtu drejtpërdrejt te Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale.",
          "Fshirja e të dhënave të lidhura me një regjistrim aktiv mjekësor mund të kufizohet kur ligji shqiptar i kujdesit shëndetësor kërkon ruajtjen e tyre.",
        ],
      },
      {
        title: "8. Të dhënat e të miturve",
        paragraphs: [
          "Platforma nuk u drejtohet të miturve. Kur ligji shqiptar kërkon ndërhyrjen e prindit ose kujdestarit, një i mitur mund të regjistrohet ose asistohet vetëm përmes llogarisë së prindit ose kujdestarit ligjor.",
        ],
      },
      {
        title: "9. Ndryshimet e kësaj politike",
        paragraphs: [
          "Ne mund ta përditësojmë këtë politikë kur ndryshon shërbimi, ligji ose nën-përpunuesit. Ndryshimet materiale publikohen në këtë faqe me datë të re përditësimi dhe, kur është e përshtatshme, u komunikohen përdoruesve të regjistruar para hyrjes në fuqi.",
        ],
      },
    ],
    referencesTitle: "Baza ligjore e përdorur për këtë politikë",
    referencesBody:
      "Kjo politikë është hartuar mbi ligjet e të dhënave personale dhe regjistrimeve shëndetësore që zbatohen për Pyet Doktorin si kontrollues të dhënash dhe për mjekët e pavarur që përdorin platformën.",
    references: [
      {
        label: "Ligji nr. 124/2024 “Për mbrojtjen e të dhënave personale”",
        href: "https://idp.al/en/about-us/",
        note: "Faqe zyrtare e Komisionerit që konfirmon kompetencat sipas ligjit nr. 124/2024.",
      },
      {
        label: "Ligji nr. 10107, datë 30.03.2009, “Për kujdesin shëndetësor në Republikën e Shqipërisë”",
        href: "https://qbz.gov.al/eli/ligj/2009/03/30/10107",
        note: "Lidhje zyrtare e referencës ligjore në QBZ — rregullon detyrimet e regjistrimit të mjekëve që përdorin platformën.",
      },
    ],
    ctaTitle: "Keni një pyetje për të dhënat tuaja?",
    ctaSubtitle:
      "Na kontaktoni para se të rezervoni, ose në çdo kohë më pas — kërkesat për akses, korrigjim ose fshirje trajtohen nga i njëjti ekip që shqyrton kushtet e përdorimit.",
    ctaPrimary: "Kontaktoni ekipin",
    ctaSecondary: "Shikoni kushtet e përdorimit",
  };
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = await getServerTranslations(locale);
  const copy = getCopy(locale, t("companyName"));

  return buildMetadata({
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    path: "/privacy-policy",
    keywords: SEO_KEYWORDS_AL,
    locale: locale === "al" ? "sq_AL" : "en_US",
  });
}

export default async function PrivacyPolicyPage() {
  const locale = await getRequestLocale();
  const t = await getServerTranslations(locale);
  const copy = getCopy(locale, t("companyName"));

  return (
    <WebsiteShell>
      <WebsiteHero
        className="website-hero--clinics"
        variant="centered"
        eyebrow={copy.eyebrow}
        title={copy.title}
        subtitle={copy.subtitle}
        primaryCta={{ label: copy.heroPrimary, href: "/contact" }}
        secondaryCta={{ label: copy.heroSecondary, href: "/terms-of-service" }}
      />

      <WebsiteSection>
        <div className="website-container">
          <div className="website-pill">{copy.sectionEyebrow}</div>
          <h2 className="website-section-title">{copy.sectionTitle}</h2>
          <p className="website-section-body">{copy.sectionSubtitle}</p>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="website-card">
              <h3 className="text-base font-semibold text-slate-900">{copy.legalNoticeTitle}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{copy.legalNoticeBody}</p>
              <div className="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                {copy.effectiveDateLabel}: {copy.effectiveDateValue}
              </div>
            </div>

            <div className="website-card">
              <h3 className="text-base font-semibold text-slate-900">{copy.controllerTitle}</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                {copy.controllerRows.map((row) => (
                  <div key={row.label} className="grid gap-1 sm:grid-cols-[150px_1fr]">
                    <dt className="font-medium text-slate-900">{row.label}</dt>
                    <dd className="text-slate-600 break-words">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-10 grid gap-6">
            {copy.sections.map((section) => (
              <section key={section.title} className="website-card">
                <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-6 text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.note && (
                  <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
                    {section.note}
                  </div>
                )}
              </section>
            ))}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <div className="website-card">
            <h2 className="website-section-title !text-3xl">{copy.referencesTitle}</h2>
            <p className="website-section-body mt-3">{copy.referencesBody}</p>
            <div className="mt-8 grid gap-4">
              {copy.references.map((reference) => (
                <div key={reference.href} className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
                  <a
                    href={reference.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 hover:text-purple-700"
                  >
                    {reference.label}
                  </a>
                  <p className="mt-2 text-sm text-slate-600">{reference.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600">
            {locale === "al" ? (
              <>
                Për kushtet e plota të përdorimit të platformës, lexoni{" "}
                <Link href="/terms-of-service" className="font-semibold text-purple-700 hover:underline">
                  Kushtet dhe Kushtet e Përdorimit
                </Link>
                . Për kërkesa lidhur me të dhënat tuaja, na shkruani te{" "}
                <a href="mailto:info@pyetdoktorin.al" className="font-semibold text-purple-700 hover:underline">
                  info@pyetdoktorin.al
                </a>
                .
              </>
            ) : (
              <>
                For the full rules of using the platform, review the{" "}
                <Link href="/terms-of-service" className="font-semibold text-purple-700 hover:underline">
                  Terms and Conditions
                </Link>
                . For requests about your data, contact us at{" "}
                <a href="mailto:info@pyetdoktorin.al" className="font-semibold text-purple-700 hover:underline">
                  info@pyetdoktorin.al
                </a>
                .
              </>
            )}
          </div>
        </div>
      </WebsiteSection>

      <WebsiteSection variant="alt">
        <div className="website-container">
          <WebsiteCta
            title={copy.ctaTitle}
            subtitle={copy.ctaSubtitle}
            primary={{ label: copy.ctaPrimary, href: "/contact" }}
            secondary={{ label: copy.ctaSecondary, href: "/terms-of-service" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}

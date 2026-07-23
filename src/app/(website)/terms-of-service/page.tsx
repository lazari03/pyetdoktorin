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
  operatorTitle: string;
  operatorRows: Array<{ label: string; value: string }>;
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
      metadataTitle: "Terms and Conditions | Pyet Doktorin",
      metadataDescription:
        "Terms and conditions for Pyet Doktorin, a software platform providing video-consultation and payment technology for independent doctors and their patients.",
      eyebrow: "Legal",
      title: "Terms and Conditions",
      subtitle:
        "Pyet Doktorin is a technology platform, not a healthcare provider. Mandatory Albanian consumer, e-commerce and data-protection rights prevail over any conflicting wording in this page.",
      heroPrimary: "Contact legal support",
      heroSecondary: "Home",
      sectionEyebrow: "Albanian-law framework",
      sectionTitle: "Your agreement with Pyet Doktorin",
      sectionSubtitle:
        "This page sets out the operational terms for bookings, payments, privacy, doctor obligations and patient rights on the Pyet Doktorin platform.",
      legalNoticeTitle: "Important legal notice",
      legalNoticeBody:
        "These terms are designed to align with Albanian consumer, electronic-commerce and personal-data law. Doctors using the platform remain independently subject to Albanian healthcare regulation. If Albanian mandatory law gives the user broader rights, Albanian law controls.",
      effectiveDateLabel: "Last updated",
      effectiveDateValue: "March 30, 2026",
      operatorTitle: "Platform operator details",
      operatorRows: [
        { label: "Operator", value: companyName },
        { label: "Website", value: "https://pyetdoktorin.al" },
        { label: "Email", value: "info@pyetdoktorin.al" },
        { label: "Registered office", value: "[complete before publication]" },
        { label: "NUIS / tax number", value: "[complete before publication]" },
      ],
      sections: [
        {
          title: "1. Scope and acceptance",
          paragraphs: [
            "These terms govern access to and use of the Pyet Doktorin website, user dashboard, booking flows, messaging features, video-call technology, and payment processing made available through the platform.",
            "By creating an account, booking a consultation, or otherwise using the platform, the user confirms that they have read and accepted these terms and the privacy policy.",
          ],
          note: "Nothing in these terms removes or limits rights that Albanian law grants to consumers, patients, minors, or data subjects.",
        },
        {
          title: "2. Role of the platform",
          paragraphs: [
            "Pyet Doktorin is a software-as-a-service (SaaS) platform. We provide independent, licensed doctors with the technology to offer video consultations to patients and to collect payment for their services. We connect patients with independent doctors — we do not provide medical services ourselves.",
            "Pyet Doktorin does not employ doctors, does not practice medicine, and does not provide medical advice, diagnosis, or treatment. Before a doctor can join the platform, we verify their identity and the professional license or credentials they submit; this verification does not make the platform a party to, or provider of, the consultation itself.",
            "Each doctor is an independent professional, solely and exclusively responsible for the medical services they choose to provide through the platform. The platform is not an ambulance service, emergency dispatch center, hospital, or substitute for urgent in-person examination.",
          ],
          bullets: [
            "For urgent medical emergencies, contact Albania's National Medical Emergency service at 127.",
            "A doctor may refuse or stop a remote consultation if an in-person visit, emergency referral, or additional verification is medically necessary.",
            "All professional medical acts, judgments and decisions remain the sole responsibility of the independent doctor providing the consultation — never the platform.",
          ],
        },
        {
          title: "3. Eligibility, account and identity information",
          paragraphs: [
            "Users must provide accurate, complete and current identity and contact information, keep credentials confidential, and use only one account for themselves unless the platform expressly supports family or caregiver access.",
            "Where Albanian law requires parental or guardian involvement, minors may use the platform only through or with the consent of a parent or lawful guardian.",
          ],
          bullets: [
            "The platform may suspend or restrict an account where information is false, misleading, incomplete, or used fraudulently.",
            "Users are responsible for activity performed through their account until they notify the platform of unauthorized use.",
          ],
        },
        {
          title: "4. Bookings, pricing, payments, cancellations and refunds",
          paragraphs: [
            "Pyet Doktorin operates the checkout and processes payment on behalf of the independent doctor for each booked consultation. Any fee payable through the platform must be shown clearly before the user confirms the order or booking request. The platform should provide an electronic confirmation and, where legally required, the corresponding fiscal or commercial documentation.",
            "Every consultation fee paid through the platform is covered by a 14-day refund guarantee: users may request a full refund within 14 days of payment, for any reason, with no exceptions or conditions attached. Cancellation, rescheduling and no-show handling are separate scheduling matters and do not limit or replace this refund right.",
          ],
          bullets: [
            "No hidden charges are applied after confirmation unless the user expressly accepts a change.",
            "Refund requests made within the 14-day window are honored in full, regardless of consultation status, service type, doctor, or institution.",
            "Where Albanian consumer law grants additional mandatory pre-contract information or withdrawal rights, those rights apply on top of, and do not reduce, this refund guarantee.",
          ],
        },
        {
          title: "5. The independent doctor's service and patient rights",
          paragraphs: [
            "The consultation itself — the medical advice, diagnosis, prescription or treatment — is a service provided directly by the independent doctor the patient books, not by Pyet Doktorin. Users must provide truthful health information, symptoms, medications and other information relevant to the consultation. Incomplete or inaccurate information may affect the safety and suitability of remote care.",
            "Patients retain the rights granted by Albanian healthcare law and patient-rights standards, including the right to understandable information, dignity, confidentiality, and informed participation in care decisions, in their relationship with the doctor.",
          ],
          bullets: [
            "Remote care may have limits compared with a physical examination.",
            "Prescriptions, recommendations, referrals and follow-up instructions must be used only by the named patient and in accordance with the doctor's instructions and Albanian law.",
            "The platform may make summary records, booking logs and communication metadata available to the patient or doctor as required for lawful service delivery and recordkeeping.",
          ],
        },
        {
          title: "6. Independent doctor obligations",
          paragraphs: [
            "Doctors and clinics using the platform act as independent, freelance professionals — never as employees or agents of Pyet Doktorin. They must hold the licenses, registrations, authorizations or professional status required by Albanian law for the services they provide, and the platform verifies this documentation before granting access.",
            "Doctors remain solely and independently responsible for the legality, quality and professional standard of the medical service they deliver to the patient. Pyet Doktorin's role is limited to providing the video-call technology, scheduling tools and payment processing that support that independent relationship.",
          ],
          bullets: [
            "Doctors must not provide services outside their scope of practice.",
            "Doctors must respect confidentiality, recordkeeping and informed-consent obligations applicable under Albanian law.",
            "The platform may suspend a doctor's account where there is evidence of licensing, safety, fraud or professional-conduct concerns.",
          ],
        },
        {
          title: "7. Acceptable use and prohibited conduct",
          paragraphs: [
            "Users may not use the platform for unlawful activity, impersonation, abuse of medical staff, scraping, reverse engineering beyond what the law mandatorily permits, malware distribution, spam, unauthorized access, or submission of deliberately false medical or payment information.",
          ],
          bullets: [
            "No harassment, threats or discriminatory conduct toward staff, doctors or other users.",
            "No use of the platform to obtain prescriptions or medical documents by fraud.",
            "No interference with system integrity, security measures or audit logs.",
          ],
        },
        {
          title: "8. Personal data, confidentiality and health data",
          paragraphs: [
            "Personal data, including health-related data, must be processed in accordance with the privacy policy and applicable Albanian personal-data legislation. Sensitive data should be processed only on a valid legal basis and with appropriate technical and organizational safeguards.",
            "Users may exercise their data-protection rights, including access, correction, deletion where applicable, objection, restriction or complaint rights, subject to the conditions and limits of Albanian law.",
          ],
          bullets: [
            "Questions or requests about personal data may be sent to info@pyetdoktorin.al.",
            "Nothing in these terms limits the user's right to complain to Albania's Commissioner for the Right to Information and the Protection of Personal Data.",
          ],
        },
        {
          title: "9. Intellectual property and platform availability",
          paragraphs: [
            "The software, design, branding, content, databases and non-user materials on the platform are owned by or licensed to Pyet Doktorin and may not be copied or commercially exploited without permission except where Albanian mandatory law allows otherwise.",
            "The platform may perform maintenance, security updates, moderation and service changes, and cannot guarantee uninterrupted availability at all times.",
          ],
        },
        {
          title: "10. Liability",
          paragraphs: [
            "Pyet Doktorin does not exclude liability that cannot legally be excluded under Albanian law. Any limitation of liability in these terms must be interpreted narrowly and only to the extent allowed by mandatory law.",
            "Because Pyet Doktorin is a technology platform and not a healthcare provider, and to the extent permitted by law, the platform is not liable for the medical acts, advice, diagnosis, treatment or professional decisions of any independent doctor, nor for losses caused by inaccurate user information, third-party internet outages, or force majeure. Liability for medical services rests with the independent doctor who provided them.",
          ],
        },
        {
          title: "11. Suspension, termination and record retention",
          paragraphs: [
            "The platform may suspend, restrict or terminate access for fraud, abuse, security incidents, unlawful use, or material breach of these terms. Where appropriate, the platform may also retain records for the period required by law, dispute handling, fraud prevention or regulatory obligations.",
          ],
        },
        {
          title: "12. Complaints, governing law and dispute resolution",
          paragraphs: [
            "Users may submit contractual, billing, privacy or service complaints to info@pyetdoktorin.al or through the contact page. The platform should review complaints within a reasonable period and keep records of complaint handling.",
            "These terms are governed by the laws of the Republic of Albania. Any dispute that cannot be resolved amicably is subject to the competent Albanian courts, without prejudice to any mandatory consumer-rights forum protections that apply under Albanian law.",
          ],
        },
        {
          title: "13. Changes to these terms",
          paragraphs: [
            "Pyet Doktorin may update these terms when the service, law, security controls or billing model changes. Material changes should be published on this page with an updated revision date and, where appropriate, communicated to registered users before they take effect.",
          ],
        },
      ],
      referencesTitle: "Legal basis used for this draft",
      referencesBody:
        "These laws primarily govern the independent doctors who use the platform, and the consumer, e-commerce and data-protection obligations that apply to Pyet Doktorin as a technology platform. These links are included so the legal basis stays visible instead of hidden behind generic language.",
      references: [
        {
          label: "Law No. 10107, dated 30.03.2009, on Healthcare in the Republic of Albania",
          href: "https://qbz.gov.al/eli/ligj/2009/03/30/10107",
          note: "Official legal reference URL on QBZ.",
        },
        {
          label: "Albanian Charter of Patient Rights / healthcare legislation portal",
          href: "https://shendetesia.gov.al/legjislacioni-3/",
          note: "Official Ministry of Health legislation portal listing the patient-rights charter.",
        },
        {
          label: "Law No. 124/2024 on the Protection of Personal Data",
          href: "https://idp.al/en/about-us/",
          note: "Official IDP page confirming the Commissioner's competences under Law No. 124/2024.",
        },
        {
          label: "Law No. 10128, dated 11.05.2009, on Electronic Commerce",
          href: "https://www.infrastruktura.gov.al/konsultim-publik-per-projektligjin-per-disa-shtesa-dhe-ndryshime-ne-ligjin-nr-10-128-date-11-5-2009-per-tregtine-elektronike-te-ndryshuar/",
          note: "Official ministry page describing the Albanian electronic-commerce law.",
        },
        {
          label: "Law No. 9902, dated 17.04.2008, on Consumer Protection",
          href: "https://qbz.gov.al/eli/ligj/2008/04/17/9902",
          note: "Official QBZ legal reference URL for Albanian consumer protection law.",
        },
      ],
      ctaTitle: "Need a legally tailored version?",
      ctaSubtitle:
        "Complete the registered-office and tax-number fields before publication and have Albanian counsel review the final text against your booking, refund and doctor onboarding workflow.",
      ctaPrimary: "Contact the team",
      ctaSecondary: "View privacy policy",
    };
  }

  return {
    metadataTitle: "Kushtet dhe kushtet e përdorimit | Pyet Doktorin",
    metadataDescription:
      "Kushtet e përdorimit të Pyet Doktorin, një platformë softuerike që ofron teknologji video-konsultimi dhe pagese për mjekë të pavarur dhe pacientët e tyre.",
    eyebrow: "Juridike",
    title: "Kushtet dhe Kushtet e Përdorimit",
    subtitle:
      "Pyet Doktorin është një platformë teknologjike, jo një ofrues i kujdesit shëndetësor. Të drejtat e detyrueshme sipas ligjit shqiptar për konsumatorin, tregtinë elektronike dhe mbrojtjen e të dhënave kanë përparësi ndaj çdo formulimi konfliktual në këtë faqe.",
    heroPrimary: "Kontaktoni mbështetjen ligjore",
    heroSecondary: "Ballina",
    sectionEyebrow: "Kuadri ligjor shqiptar",
    sectionTitle: "Marrëveshja juaj me Pyet Doktorin",
    sectionSubtitle:
      "Kjo faqe përcakton kushtet operacionale për rezervimet, pagesat, privatësinë, detyrimet e mjekëve dhe të drejtat e pacientit në platformën Pyet Doktorin.",
    legalNoticeTitle: "Njoftim i rëndësishëm ligjor",
    legalNoticeBody:
      "Këto kushte janë hartuar për t'u përafruar me ligjin shqiptar për mbrojtjen e konsumatorit, tregtinë elektronike dhe të dhënat personale. Mjekët që përdorin platformën i nënshtrohen në mënyrë të pavarur rregullimit shqiptar të kujdesit shëndetësor. Nëse ligji shqiptar i detyrueshëm i jep përdoruesit të drejta më të gjera, zbatohet ligji shqiptar.",
    effectiveDateLabel: "Përditësuar më",
    effectiveDateValue: "30 mars 2026",
    operatorTitle: "Të dhënat e operatorit të platformës",
    operatorRows: [
      { label: "Operatori", value: companyName },
      { label: "Faqja", value: "https://pyetdoktorin.al" },
      { label: "Email", value: "info@pyetdoktorin.al" },
      { label: "Selia e regjistruar", value: "[plotësojeni para publikimit]" },
      { label: "NUIS / NIPT", value: "[plotësojeni para publikimit]" },
    ],
    sections: [
      {
        title: "1. Fusha e zbatimit dhe pranimi i kushteve",
        paragraphs: [
          "Këto kushte rregullojnë aksesin dhe përdorimin e faqes Pyet Doktorin, panelit të përdoruesit, rrjedhave të rezervimit, funksioneve të komunikimit, teknologjisë së video-thirrjeve dhe përpunimit të pagesave që vihen në dispozicion në platformë.",
          "Duke krijuar llogari, duke rezervuar konsultë ose duke përdorur platformën në çfarëdo forme, përdoruesi konfirmon se i ka lexuar dhe pranuar këto kushte dhe politikën e privatësisë.",
        ],
        note: "Asgjë në këto kushte nuk heq ose kufizon të drejtat që ligji shqiptar u jep konsumatorëve, pacientëve, të miturve ose subjekteve të të dhënave.",
      },
      {
        title: "2. Roli i platformës",
        paragraphs: [
          "Pyet Doktorin është një platformë softuerike (SaaS). Ne u ofrojmë mjekëve të pavarur e të licencuar teknologjinë për të ofruar video-konsultime me pacientët dhe për të mbledhur pagesën për shërbimet e tyre. Ne lidhim pacientët me mjekë të pavarur — ne vetë nuk ofrojmë shërbime mjekësore.",
          "Pyet Doktorin nuk punëson mjekë, nuk ushtron mjekësinë dhe nuk jep këshilla mjekësore, diagnozë apo trajtim. Përpara se një mjek të bashkohet me platformën, ne verifikojmë identitetin dhe licencën apo kredencialet profesionale që ai paraqet; ky verifikim nuk e bën platformën palë në konsultë apo ofrues të saj.",
          "Çdo mjek është një profesionist i pavarur, i vetmi dhe ekskluzivi përgjegjës për shërbimet mjekësore që zgjedh t'i ofrojë përmes platformës. Platforma nuk është ambulancë, urgjencë kombëtare, spital apo zëvendësim i ekzaminimit fizik urgjent.",
        ],
        bullets: [
          "Për urgjenca shëndetësore, kontaktoni Urgjencën Kombëtare Mjekësore në numrin 127.",
          "Mjeku mund të refuzojë ose ndërpresë konsultën online nëse nevojitet vizitë fizike, referim urgjent ose verifikim shtesë.",
          "Të gjitha aktet, gjykimet dhe vendimet profesionale mjekësore mbeten përgjegjësi vetëm e mjekut të pavarur që jep konsultën — kurrë e platformës.",
        ],
      },
      {
        title: "3. Përdorueshmëria, llogaria dhe të dhënat identifikuese",
        paragraphs: [
          "Përdoruesi duhet të japë të dhëna të sakta, të plota dhe të përditësuara për identitetin dhe kontaktin, të ruajë konfidencialitetin e kredencialeve dhe të përdorë vetëm një llogari për vete, përveç rasteve kur platforma lejon shprehimisht akses familjar ose kujdestar.",
          "Kur ligji shqiptar kërkon ndërhyrjen e prindit ose kujdestarit, të miturit mund ta përdorin platformën vetëm përmes ose me pëlqimin e prindit ose kujdestarit ligjor.",
        ],
        bullets: [
          "Platforma mund të pezullojë ose kufizojë llogarinë kur të dhënat janë të rreme, mashtruese, të paplota ose përdoren në mënyrë abuzive.",
          "Përdoruesi mban përgjegjësi për veprimet e kryera nga llogaria e tij derisa të njoftojë platformën për përdorim të paautorizuar.",
        ],
      },
      {
        title: "4. Rezervimet, çmimet, pagesat, anulimet dhe rimbursimet",
        paragraphs: [
          "Pyet Doktorin menaxhon procesin e pagesës dhe e përpunon atë në emër të mjekut të pavarur për çdo konsultë të rezervuar. Çdo tarifë që paguhet përmes platformës duhet të shfaqet qartë para se përdoruesi të konfirmojë porosinë ose kërkesën për rezervim. Platforma duhet të japë konfirmim elektronik dhe, kur kërkohet nga ligji, dokumentacionin përkatës fiskal ose tregtar.",
          "Çdo tarifë konsultimi e paguar përmes platformës mbulohet nga një garanci rimbursimi prej 14 ditësh: përdoruesit mund të kërkojnë rimbursim të plotë brenda 14 ditëve nga pagesa, për çdo arsye, pa asnjë përjashtim apo kusht. Anulimi, ricaktimi dhe mungesa në takim janë çështje të veçanta të planifikimit dhe nuk e kufizojnë apo zëvendësojnë këtë të drejtë rimbursimi.",
        ],
        bullets: [
          "Nuk aplikohen tarifa të fshehura pas konfirmimit, përveç nëse përdoruesi pranon shprehimisht ndryshimin.",
          "Kërkesat për rimbursim brenda afatit 14-ditor respektohen plotësisht, pavarësisht statusit të konsultës, llojit të shërbimit, mjekut apo institucionit.",
          "Kur ligji shqiptar i konsumatorit jep të drejta shtesë të detyrueshme për informacion para-kontraktor ose tërheqje, ato të drejta zbatohen përveç, dhe nuk zvogëlojnë, këtë garanci rimbursimi.",
        ],
      },
      {
        title: "5. Shërbimi i mjekut të pavarur dhe të drejtat e pacientit",
        paragraphs: [
          "Vetë konsulta — këshilla mjekësore, diagnoza, receta apo trajtimi — është një shërbim i ofruar drejtpërdrejt nga mjeku i pavarur që pacienti rezervon, jo nga Pyet Doktorin. Përdoruesi duhet të japë informacion të vërtetë për gjendjen shëndetësore, simptomat, medikamentet dhe çdo të dhënë tjetër të rëndësishme për konsultën. Informacioni i pasaktë ose i paplotë mund të ndikojë në sigurinë dhe përshtatshmërinë e kujdesit në distancë.",
          "Pacientët ruajnë të drejtat që u njeh ligji shqiptar i kujdesit shëndetësor dhe standardet për të drejtat e pacientit, përfshirë të drejtën për informacion të kuptueshëm, dinjitet, konfidencialitet dhe pjesëmarrje të informuar në vendimmarrjen për kujdesin, në marrëdhënien e tyre me mjekun.",
        ],
        bullets: [
          "Kujdesi në distancë mund të ketë kufizime krahasuar me një ekzaminim fizik.",
          "Recetat, rekomandimet, referimet dhe udhëzimet e ndjekjes përdoren vetëm nga pacienti i emërtuar dhe sipas udhëzimeve të mjekut dhe ligjit shqiptar.",
          "Platforma mund të ruajë ose paraqesë përmbledhje të konsultës, log-e rezervimesh dhe metadata komunikimi aq sa kërkohet për ofrimin e ligjshëm të shërbimit dhe për detyrimet e ruajtjes së evidencave.",
        ],
      },
      {
        title: "6. Detyrimet e mjekut të pavarur",
        paragraphs: [
          "Mjekët dhe klinikat që përdorin platformën veprojnë si profesionistë të pavarur, freelance — kurrë si punonjës apo agjentë të Pyet Doktorin. Ata duhet të kenë licencat, regjistrimet, autorizimet ose statusin profesional që kërkohet nga ligji shqiptar për shërbimet që ofrojnë, dhe platforma verifikon këtë dokumentacion përpara se t'u japë akses.",
          "Mjekët mbeten të vetmit dhe në mënyrë të pavarur përgjegjës për ligjshmërinë, cilësinë dhe standardin profesional të shërbimit mjekësor që i japin pacientit. Roli i Pyet Doktorin kufizohet në ofrimin e teknologjisë së video-thirrjeve, mjeteve të planifikimit dhe përpunimit të pagesave që mbështesin këtë marrëdhënie të pavarur.",
        ],
        bullets: [
          "Mjekët nuk duhet të ofrojnë shërbime jashtë fushës së tyre të kompetencës.",
          "Mjekët duhet të respektojnë detyrimet ligjore për konfidencialitetin, dokumentimin dhe pëlqimin e informuar.",
          "Platforma mund të pezullojë llogarinë e një mjeku kur ka indicie për probleme licencimi, sigurie, mashtrimi ose sjelljeje profesionale.",
        ],
      },
      {
        title: "7. Përdorimi i lejuar dhe ndalimet",
        paragraphs: [
          "Platforma nuk mund të përdoret për veprimtari të paligjshme, përfaqësim të rremë, abuzim verbal ndaj stafit mjekësor, scraping, reverse engineering përtej asaj që lejohet detyrimisht nga ligji, shpërndarje malware, spam, akses të paautorizuar ose paraqitje të qëllimshme të informacionit të rremë mjekësor ose të pagesës.",
        ],
        bullets: [
          "Ndalohen ngacmimet, kërcënimet dhe sjellja diskriminuese ndaj stafit, mjekëve ose përdoruesve të tjerë.",
          "Ndalohen përpjekjet për të marrë receta ose dokumente mjekësore me mashtrim.",
          "Ndalohet cenimi i integritetit të sistemit, masave të sigurisë ose log-eve të auditimit.",
        ],
      },
      {
        title: "8. Të dhënat personale, konfidencialiteti dhe të dhënat shëndetësore",
        paragraphs: [
          "Të dhënat personale, përfshirë të dhënat shëndetësore, duhet të përpunohen në përputhje me politikën e privatësisë dhe legjislacionin shqiptar për mbrojtjen e të dhënave personale. Të dhënat sensitive duhet të përpunohen vetëm mbi bazë të vlefshme ligjore dhe me masa të përshtatshme teknike e organizative.",
          "Përdoruesi mund të ushtrojë të drejtat e tij për akses, korrigjim, fshirje kur lejohet, kundërshtim, kufizim ose ankim, sipas kushteve dhe kufizimeve që parashikon ligji shqiptar.",
        ],
        bullets: [
          "Kërkesat për të dhënat personale mund të dërgohen në info@pyetdoktorin.al.",
          "Asgjë në këto kushte nuk kufizon të drejtën e përdoruesit për t'u ankuar te Komisioneri për të Drejtën e Informimit dhe Mbrojtjen e të Dhënave Personale.",
        ],
      },
      {
        title: "9. Pronësia intelektuale dhe disponueshmëria e platformës",
        paragraphs: [
          "Programi kompjuterik, dizajni, marka, përmbajtja, bazat e të dhënave dhe materialet jo të krijuara nga përdoruesit janë pronë e Pyet Doktorin ose licencohen prej tij dhe nuk mund të kopjohen ose shfrytëzohen komercialisht pa leje, përveç kur ligji shqiptar lejon detyrimisht ndryshe.",
          "Platforma mund të kryejë mirëmbajtje, përditësime sigurie, moderim dhe ndryshime shërbimi dhe nuk garanton disponueshmëri të pandërprerë në çdo kohë.",
        ],
      },
      {
        title: "10. Përgjegjësia",
        paragraphs: [
          "Pyet Doktorin nuk përjashton përgjegjësinë që nuk mund të përjashtohet ligjërisht sipas ligjit shqiptar. Çdo kufizim përgjegjësie në këtë faqe interpretohet ngushtësisht dhe vetëm në masën që lejohet nga ligji i detyrueshëm.",
          "Meqenëse Pyet Doktorin është një platformë teknologjike dhe jo një ofrues i kujdesit shëndetësor, dhe në masën që lejohet nga ligji, platforma nuk përgjigjet për aktet mjekësore, këshillat, diagnozën, trajtimin apo vendimet profesionale të asnjë mjeku të pavarur, as për humbje të shkaktuara nga informacion i pasaktë i përdoruesit, ndërprerje interneti nga palë të treta, ose force majeure. Përgjegjësia për shërbimet mjekësore i takon mjekut të pavarur që i ka ofruar ato.",
        ],
      },
      {
        title: "11. Pezullimi, mbyllja dhe ruajtja e evidencave",
        paragraphs: [
          "Platforma mund të pezullojë, kufizojë ose mbyllë aksesin në rast mashtrimi, abuzimi, incidenti sigurie, përdorimi të paligjshëm ose shkeljeje materiale të këtyre kushteve. Kur kërkohet, platforma mund të ruajë evidenca për periudhën që kërkon ligji, trajtimi i mosmarrëveshjeve, parandalimi i mashtrimit ose detyrimet rregullatore.",
        ],
      },
      {
        title: "12. Ankesat, ligji i zbatueshëm dhe mosmarrëveshjet",
        paragraphs: [
          "Përdoruesi mund të paraqesë ankesa kontraktore, për faturim, privatësi ose cilësi shërbimi në info@pyetdoktorin.al ose përmes faqes së kontaktit. Platforma duhet t'i shqyrtojë ankesat brenda një afati të arsyeshëm dhe të mbajë evidencë për trajtimin e tyre.",
          "Këto kushte rregullohen nga ligjet e Republikës së Shqipërisë. Çdo mosmarrëveshje që nuk zgjidhet me mirëkuptim i nënshtrohet gjykatave kompetente shqiptare, pa cenuar mbrojtjet e detyrueshme procedurale që ligji shqiptar i jep konsumatorit.",
        ],
      },
      {
        title: "13. Ndryshimet e kushteve",
        paragraphs: [
          "Pyet Doktorin mund t'i ndryshojë këto kushte kur ndryshon shërbimi, ligji, masat e sigurisë ose modeli i pagesave. Ndryshimet materiale duhet të publikohen në këtë faqe me datë të re përditësimi dhe, kur është e përshtatshme, t'u komunikohen përdoruesve të regjistruar para hyrjes në fuqi.",
        ],
      },
    ],
    referencesTitle: "Baza ligjore e përdorur për këtë draft",
    referencesBody:
      "Këto ligje rregullojnë kryesisht mjekët e pavarur që përdorin platformën, si dhe detyrimet për konsumatorin, tregtinë elektronike dhe mbrojtjen e të dhënave që zbatohen për Pyet Doktorin si platformë teknologjike. Lidhjet më poshtë janë shtuar që baza ligjore të jetë e dukshme dhe jo e fshehur pas një teksti të përgjithshëm marketingu.",
    references: [
      {
        label: "Ligji nr. 10107, datë 30.03.2009, “Për kujdesin shëndetësor në Republikën e Shqipërisë”",
        href: "https://qbz.gov.al/eli/ligj/2009/03/30/10107",
        note: "Lidhje zyrtare e referencës ligjore në QBZ.",
      },
      {
        label: "Portali i legjislacionit të Ministrisë së Shëndetësisë / Karta e të Drejtave të Pacientit",
        href: "https://shendetesia.gov.al/legjislacioni-3/",
        note: "Portal zyrtar i Ministrisë së Shëndetësisë që liston edhe Kartën Shqiptare të të Drejtave të Pacientit.",
      },
      {
        label: "Ligji nr. 124/2024 “Për mbrojtjen e të dhënave personale”",
        href: "https://idp.al/en/about-us/",
        note: "Faqe zyrtare e Komisionerit që konfirmon kompetencat sipas ligjit nr. 124/2024.",
      },
      {
        label: "Ligji nr. 10128, datë 11.05.2009, “Për tregtinë elektronike”",
        href: "https://www.infrastruktura.gov.al/konsultim-publik-per-projektligjin-per-disa-shtesa-dhe-ndryshime-ne-ligjin-nr-10-128-date-11-5-2009-per-tregtine-elektronike-te-ndryshuar/",
        note: "Faqe zyrtare e ministrisë që përshkruan ligjin shqiptar për tregtinë elektronike.",
      },
      {
        label: "Ligji nr. 9902, datë 17.04.2008, “Për mbrojtjen e konsumatorëve”",
        href: "https://qbz.gov.al/eli/ligj/2008/04/17/9902",
        note: "Lidhje zyrtare e referencës ligjore në QBZ për ligjin e mbrojtjes së konsumatorit.",
      },
    ],
    ctaTitle: "Ju duhet një version i personalizuar juridikisht?",
    ctaSubtitle:
      "Plotësoni selinë dhe NUIS/NIPT para publikimit dhe kërkoni rishikim nga një avokat shqiptar sipas rrjedhës suaj reale të rezervimeve, rimbursimeve dhe verifikimit të mjekëve.",
    ctaPrimary: "Kontaktoni ekipin",
    ctaSecondary: "Shikoni politikën e privatësisë",
  };
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  const t = await getServerTranslations(locale);
  const copy = getCopy(locale, t("companyName"));

  return buildMetadata({
    title: copy.metadataTitle,
    description: copy.metadataDescription,
    path: "/terms-of-service",
    keywords: SEO_KEYWORDS_AL,
    locale: locale === "al" ? "sq_AL" : "en_US",
  });
}

export default async function TermsOfServicePage() {
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
        secondaryCta={{ label: copy.heroSecondary, href: "/" }}
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
              <h3 className="text-base font-semibold text-slate-900">{copy.operatorTitle}</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                {copy.operatorRows.map((row) => (
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
                Për çështje privatësie, lexoni edhe{" "}
                <Link href="/privacy-policy" className="font-semibold text-purple-700 hover:underline">
                  Politikën e Privatësisë
                </Link>
                . Për ankesa kontraktore ose kërkesa ligjore, na shkruani te{" "}
                <a href="mailto:info@pyetdoktorin.al" className="font-semibold text-purple-700 hover:underline">
                  info@pyetdoktorin.al
                </a>
                .
              </>
            ) : (
              <>
                For privacy matters, also review the{" "}
                <Link href="/privacy-policy" className="font-semibold text-purple-700 hover:underline">
                  Privacy Policy
                </Link>
                . For contractual complaints or legal requests, contact us at{" "}
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
            secondary={{ label: copy.ctaSecondary, href: "/privacy-policy" }}
          />
        </div>
      </WebsiteSection>
    </WebsiteShell>
  );
}

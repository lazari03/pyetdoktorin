'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export default function ModernCtaSection() {
  const { t } = useTranslation();
  const imageSrc = "/api/images?key=avatar1";

  return (
    <section className="relative py-24 px-4 bg-[#ede9fe] overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text & CTA */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <span className="inline-flex items-center justify-center bg-purple-100 text-purple-600 rounded-full p-2 mb-4">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#fff"/><path d="M12 17a5 5 0 0 1-5-5V9a5 5 0 0 1 10 0v3a5 5 0 0 1-5 5Zm0 0v2m-7 0h14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#0a2e2e] mb-4 tracking-tight leading-tight drop-shadow-sm">{t('modernCtaTitle')}</h2>
          <p className="text-lg text-[#0a2e2e] mb-8 max-w-xl leading-relaxed">{t('modernCtaBody')}</p>
          <Link
            href="/clinicians"
            className="inline-flex items-center text-[#0a2e2e] font-semibold hover:underline text-lg group"
          >
            {t('modernCtaLink')}
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="#0a2e2e" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        </div>
        {/* Right: Doctor image with floating waiting room card */}
        <div className="flex-1 flex justify-center items-center relative min-w-[340px]">
          <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-[#ede9fe] bg-white max-w-xl w-full relative">
            <Image
              src={imageSrc}
              alt={t('telemedicineIllustration')}
              width={420}
              height={420}
              className="object-cover w-full h-96"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

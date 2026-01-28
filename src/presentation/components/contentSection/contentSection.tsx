'use client';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

export default function ContentSection() {
  const { t } = useTranslation();
  // Placeholder image and logo
  const doctorImage = "/api/images?key=child1";

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center bg-[#ede9fe] px-2 py-20 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16 relative">
        {/* Left: Card with logo and image */}
        <div className="flex-1 flex items-center justify-center relative min-w-[340px]">
             <Image
                src={doctorImage}
                alt={t('telemedicineConsultationAlt')}
                width={220}
                height={320}
                className="object-cover rounded-2xl border-4 border-white shadow-lg"
              />
        </div>
        {/* Right: Security content */}
        <div className="flex-1 flex flex-col items-center md:items-start justify-center px-2 md:px-0">
          <div className="mb-4">
            <span className="inline-flex items-center justify-center bg-orange-100 text-orange-600 rounded-full p-2 mb-2">
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="12" fill="#fff"/><path d="M12 17a5 5 0 0 1-5-5V9a5 5 0 0 1 10 0v3a5 5 0 0 1-5 5Zm0 0v2m-7 0h14" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0a2e2e] mb-4">{t('securityTitle')}</h2>
          <p className="text-lg text-[#0a2e2e] mb-6 max-w-lg">{t('securityBody')}</p>
          <a href="#" className="inline-flex items-center text-[#0a2e2e] font-semibold hover:underline text-lg group">
            {t('securityCta')}
            <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="#0a2e2e" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </a>
        </div>
      </div>
    </section>
  );
}

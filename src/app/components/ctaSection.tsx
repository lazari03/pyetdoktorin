"use client";

import Image from 'next/image';
import heroSectionStrings from './heroSection.strings';

export default function CtaSection() {
  const locale = 'en';
  const strings = heroSectionStrings[locale]?.ctaSection || heroSectionStrings.en.ctaSection;
  const imageSrc = strings.imageSrc || "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-mastercowley-1199590.jpg";

  return (
    <section className="bg-white py-20 px-4">
      <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-12 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl p-8 md:p-16 relative overflow-hidden">
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{strings.title}</h2>
          <p className="text-lg text-gray-200 mb-8">{strings.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center md:justify-start">
            <a
              href={strings.primaryButtonLink}
              className="rounded-full bg-orange-600 px-6 py-3 text-base font-semibold text-white shadow hover:bg-orange-500 transition-colors text-center"
            >
              {strings.primaryButtonText}
            </a>
            <a
              href={strings.secondaryButtonLink}
              className="rounded-full border border-orange-400 px-6 py-3 text-base font-semibold text-orange-400 bg-white/10 hover:bg-orange-500 hover:text-white transition-colors text-center"
            >
              {strings.secondaryButtonText}
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <Image
            src={imageSrc}
            alt="Telemedicine Illustration"
            width={420}
            height={280}
            className="rounded-2xl object-cover shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
}

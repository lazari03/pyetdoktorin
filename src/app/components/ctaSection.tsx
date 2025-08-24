"use client";

import Image from 'next/image';
import heroSectionStrings from './heroSection.strings';

export default function CtaSection() {
  const locale = 'en';
  const strings = heroSectionStrings[locale]?.ctaSection || heroSectionStrings.en.ctaSection;
  const imageSrc = strings.imageSrc || "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-mastercowley-1199590.jpg";

  return (
    <section className="w-full bg-white py-16 px-4 flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto flex flex-col md:flex-row items-center gap-8 rounded-2xl shadow-lg p-0 overflow-hidden">
        <div className="flex-1 flex flex-col justify-center p-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-orange-600 mb-3">{strings.title}</h2>
          <p className="text-lg text-gray-700 mb-6">{strings.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-between items-center">
            <a
              href={strings.primaryButtonLink}
              className="rounded-full bg-orange-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-orange-700 hover:text-white transition-colors text-center"
            >
              {strings.primaryButtonText}
            </a>
            <a
              href={strings.secondaryButtonLink}
              className="rounded-full border-2 border-orange-400 px-8 py-4 text-base font-semibold text-orange-600 bg-white hover:bg-orange-500 hover:text-white transition-colors text-center"
            >
              {strings.secondaryButtonText}
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center bg-orange-50 h-full p-8">
          <Image
            src={imageSrc || '/img/profile_placeholder.png'}
            alt="Doctor Placeholder"
            width={320}
            height={320}
            className="rounded-2xl object-cover shadow border-2 border-orange-100 w-56 h-56"
            priority
          />
        </div>
      </div>
    </section>
  );
}

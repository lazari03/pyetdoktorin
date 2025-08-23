import heroSectionStrings from './heroSection.strings';
import Image from 'next/image';

export default function ModernCtaSection() {
  const locale = 'en';
  const strings = heroSectionStrings[locale]?.ctaSection || heroSectionStrings.en.ctaSection;
  const imageSrc = strings.imageSrc || "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-mastercowley-1199590.jpg";

  return (
  <section className="relative py-20 px-4 bg-gradient-to-br from-orange-100/80 via-white/90 to-orange-200/80 overflow-hidden" style={{marginTop: '-2rem'}}>
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center gap-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 drop-shadow mb-2">{strings.title}</h2>
        <p className="text-lg text-gray-700 mb-6 max-w-2xl mx-auto">{strings.description}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={strings.primaryButtonLink}
            className="inline-block rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-orange-500 transition-colors"
          >
            {strings.primaryButtonText}
          </a>
          <a
            href={strings.secondaryButtonLink}
            className="inline-block rounded-full border border-orange-400 px-8 py-4 text-lg font-semibold text-orange-600 bg-white hover:bg-orange-50 transition-colors"
          >
            {strings.secondaryButtonText}
          </a>
        </div>
        <div className="mt-12 w-full flex justify-center">
          <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
            <Image
              src={imageSrc}
              alt="Telemedicine Illustration"
              width={600}
              height={360}
              className="object-cover w-full h-72 sm:h-80"
              priority
            />
          </div>
        </div>
      </div>
  {/* Bottom fade for smooth transition */}
  <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-orange-100 z-10" />
    </section>
  );
}

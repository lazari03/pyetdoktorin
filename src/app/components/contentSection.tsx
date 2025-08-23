
import { VideoCameraIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';
import heroSectionStrings from './heroSection.strings';


export default function ContentSection() {
  const locale = 'en';
  const strings = heroSectionStrings[locale]?.contentSection || heroSectionStrings.en.contentSection;
  const imageUrl = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/sick-senior-woman-talking-with-young-doctor-remote-consultation.jpg";

  return (
  <section className="relative min-h-[60vh] flex items-center justify-center bg-white pt-16 pb-32 px-2 overflow-hidden">
  {/* Decorative orange circle: bottom half, aligns with top half in previous section */}
  <div className="absolute -top-48 -left-32 w-96 h-48" />
      {/* Stronger bottom fade for seamless transition */}
  <div className="pointer-events-none absolute left-0 right-0 bottom-0 h-64 " style={{marginBottom: '-2rem'}} />
  <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 relative">
        {/* Left: Image */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Image
            src={imageUrl}
            alt="Telemedicine Consultation"
            width={380}
            height={380}
            className="object-cover w-full h-72 sm:h-80 rounded-2xl shadow"
          />
        </div>
        {/* Right: Content */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start px-2 md:px-0">
          <p className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">{strings.badge}</p>
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">{strings.title}</h2>
          <p className="text-lg text-gray-700 mb-6">{strings.subtitle}</p>
          <ul className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-gray-700 mb-8">
            <li className="flex flex-col items-center">
              <VideoCameraIcon className="h-8 w-8 text-orange-500 mb-2" />
              <span className="font-semibold text-gray-900 mb-1">{strings.features[0].title}</span>
              <span className="text-sm text-gray-600 text-center">{strings.features[0].desc}</span>
            </li>
            <li className="flex flex-col items-center">
              <ShieldCheckIcon className="h-8 w-8 text-orange-500 mb-2" />
              <span className="font-semibold text-gray-900 mb-1">{strings.features[1].title}</span>
              <span className="text-sm text-gray-600 text-center">{strings.features[1].desc}</span>
            </li>
            <li className="flex flex-col items-center">
              <HeartIcon className="h-8 w-8 text-orange-500 mb-2" />
              <span className="font-semibold text-gray-900 mb-1">{strings.features[2].title}</span>
              <span className="text-sm text-gray-600 text-center">{strings.features[2].desc}</span>
            </li>
          </ul>
          <div className="max-w-2xl mx-auto text-center md:text-left">
            <p className="text-base text-gray-700 mb-4">{strings.cta}</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{strings.whyTitle}</h3>
            <p className="text-base text-gray-600">{strings.whyDesc}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

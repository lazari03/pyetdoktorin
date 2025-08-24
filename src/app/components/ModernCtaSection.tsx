

import Image from 'next/image';


export default function ModernCtaSection() {
  // Example fallback strings, replace with your string file imports as needed
  const strings = {
    title: 'Telemedicine at Your Fingertips',
    description: 'Access healthcare professionals anytime, anywhere. Join us today and experience the future of medicine.',
  registerButtonText: 'Register',
  registerButtonLink: '/register',
  hookText: 'Join as a patient or doctor.',
    imageSrc: "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-mastercowley-1199590.jpg"
  };
  const imageSrc = strings.imageSrc;

  return (
    <section className="relative py-24 px-4 bg-gradient-to-br from-orange-100 via-white to-orange-200 overflow-hidden mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Left: Text & Buttons */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h2 className="text-5xl font-bold text-orange-600 mb-4 tracking-tight leading-tight drop-shadow-sm">{strings.title}</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-xl leading-relaxed">{strings.description}</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-between items-center">
            <span className="text-lg font-bold text-orange-600 mr-0 sm:mr-4 mb-2 sm:mb-0">{strings.hookText}</span>
            <a
              href={strings.registerButtonLink}
              className="rounded-full bg-orange-600 px-8 py-4 text-lg font-semibold text-white shadow-lg hover:bg-orange-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition no-underline"
              style={{ textDecoration: 'none' }}
            >
              {strings.registerButtonText}
            </a>
          </div>
        </div>
        {/* Right: Image in card */}
        <div className="flex-1 flex justify-center items-center">
          <div className="rounded-2xl overflow-hidden shadow-xl border-2 border-orange-100 bg-white max-w-xl w-full">
            <Image
              src={imageSrc}
              alt="Telemedicine Illustration"
              width={520}
              height={340}
              className="object-cover w-full h-72 sm:h-80"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

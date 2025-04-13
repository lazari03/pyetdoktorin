"use client";

import Image from 'next/image';

type ExampleProps = {
  title?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  imageSrc?: string;
};

export default function CtaSection({
  title = "Telemedicine at Your Fingertips",
  description = "Access healthcare professionals anytime, anywhere. Join us today and experience the future of medicine.",
  primaryButtonText = "Register as a Patient",
  primaryButtonLink = "#",
  secondaryButtonText = "Register as a Doctor",
  secondaryButtonLink = "#",
  imageSrc = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/pexels-mastercowley-1199590.jpg",  
}: ExampleProps) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="relative isolate overflow-hidden bg-gray-900 px-6 pt-16 shadow-2xl sm:rounded-3xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0 z-10">
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-[64rem] -translate-y-1/2 [mask-image:radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle r={512} cx={512} cy={512} fill="url(#gradient)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="gradient">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>

          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-32 lg:text-left">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2>
            <p className="mt-6 text-lg text-gray-300">{description}</p>
            <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
              <a
                href={primaryButtonLink}
                className="rounded-md bg-orange-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-orange-500 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {primaryButtonText}
              </a>
              <a
                href={secondaryButtonLink}
                className="text-sm font-semibold text-white hover:text-white hover:bg-orange-500 px-3 py-2 rounded-md"
              >
                {secondaryButtonText} <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          <div className="relative mt-16 h-80 lg:mt-8">
            <Image 
              src={imageSrc}
              alt="Telemedicine Illustration"
              width={500}
              height={300}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}

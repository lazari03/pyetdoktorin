import { VideoCameraIcon, ShieldCheckIcon, HeartIcon } from '@heroicons/react/20/solid';
import Image from 'next/image'; // Import Image from next/image

export default function TelemedicineSection() {
  const imageUrl = "https://portokalle-storage.fra1.digitaloceanspaces.com/img/sick-senior-woman-talking-with-young-doctor-remote-consultation.jpg";

  return (
    <div className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-32 lg:overflow-visible lg:px-0">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          aria-hidden="true"
          className="absolute top-0 left-[max(50%,25rem)] h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]"
        >
          <defs>
            <pattern
              x="50%"
              y={-1}
              id="telemedicine-pattern"
              width={200}
              height={200}
              patternUnits="userSpaceOnUse"
            >
              <path d="M100 200V.5M.5 .5H200" fill="none" />
            </pattern>
          </defs>
          <rect fill="url(#telemedicine-pattern)" width="100%" height="100%" strokeWidth={0} />
        </svg>
      </div>
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start lg:gap-y-10">
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="lg:max-w-lg">
              <p className="text-base/7 font-semibold text-orange-600">Telemedicine Made Easy</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Your Health, Anywhere
              </h1>
              <p className="mt-6 text-xl/8 text-gray-700">
                Connect with certified healthcare professionals from the comfort of your home. Experience seamless and secure virtual consultations tailored to your needs.
              </p>
            </div>
          </div>
        </div>
        <div className="-mt-12 -ml-12 p-12 lg:sticky lg:top-4 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:overflow-hidden">
          <div className="flex items-center justify-center h-100 bg-gray-100 rounded-lg">
            <Image
              src={imageUrl}
              alt="Telemedicine Consultation"
              width={500} // Specify width
              height={500} // Specify height
              className="h-full w-auto object-contain rounded-lg"
            />
          </div>
        </div>
        <div className="lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:mx-auto lg:grid lg:w-full lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
          <div className="lg:pr-4">
            <div className="max-w-xl text-base/7 text-gray-700 lg:max-w-lg">
              <p>
                Our telemedicine platform ensures you receive the best care, no matter where you are. From general consultations to specialized care, we have you covered.
              </p>
              <ul role="list" className="mt-8 space-y-8 text-gray-600">
                <li className="flex gap-x-3">
                  <VideoCameraIcon aria-hidden="true" className="mt-1 size-5 flex-none text-orange-600" />
                  <span>
                    <strong className="font-semibold text-gray-900">Virtual Consultations.</strong> Speak with doctors and specialists via secure video calls, anytime, anywhere.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <ShieldCheckIcon aria-hidden="true" className="mt-1 size-5 flex-none text-orange-600" />
                  <span>
                    <strong className="font-semibold text-gray-900">Secure and Private.</strong> Your health data is encrypted and protected, ensuring complete confidentiality.
                  </span>
                </li>
                <li className="flex gap-x-3">
                  <HeartIcon aria-hidden="true" className="mt-1 size-5 flex-none text-orange-600" />
                  <span>
                    <strong className="font-semibold text-gray-900">Comprehensive Care.</strong> From prescriptions to follow-ups, manage your health effortlessly.
                  </span>
                </li>
              </ul>
              <p className="mt-8">
                Join thousands of satisfied patients who trust our platform for their healthcare needs. Experience the future of medicine today.
              </p>
              <h2 className="mt-16 text-2xl font-bold tracking-tight text-gray-900">Why Choose Telemedicine?</h2>
              <p className="mt-6">
                Save time, reduce stress, and access quality healthcare without leaving your home. Our platform is designed to make healthcare accessible, affordable, and efficient.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

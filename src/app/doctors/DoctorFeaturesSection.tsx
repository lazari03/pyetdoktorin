import React from 'react';
import { useTranslation } from 'react-i18next';
import Image from "next/image";

export default function DoctorFeaturesSection() {
  const { t } = useTranslation();
  
  return (
  <section className="relative min-h-[50vh] flex items-center justify-center bg-white py-16 px-2 overflow-hidden mb-12">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row-reverse items-center gap-12 relative">
        {/* Right: Image */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <Image
            src="https://pyetdoktorin-storage.fra1.digitaloceanspaces.com/img/Screenshot%202025-08-25%20at%209.27.02%E2%80%AFPM.png"
            alt="Doctor at work"
            width={380}
            height={380}
            className="object-cover w-full h-72 sm:h-80 rounded-2xl shadow border-2 border-orange-100 bg-white"
            priority
          />
        </div>
        {/* Left: Features */}
        <div className="flex-1 flex flex-col justify-center items-center md:items-start px-2 md:px-0">
          <h3 className="text-sm font-semibold text-orange-600 uppercase tracking-widest mb-2">{t('whatWeOfferDoctors')}</h3>
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-4">{t('empoweringYourPractice')}</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl text-gray-700 mb-8">
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('trackPatientVisits')}</span>
              <span className="text-sm text-gray-600">{t('monitorImpactRealTime')}</span>
            </li>
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('transparentPayment')}</span>
              <span className="text-sm text-gray-600">{t('knowEarningsInstantly')}</span>
            </li>
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('integratedCalendar')}</span>
              <span className="text-sm text-gray-600">{t('stayOrganized')}</span>
            </li>
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('professionalProfile')}</span>
              <span className="text-sm text-gray-600">{t('showcaseExpertise')}</span>
            </li>
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('supportCredibility')}</span>
              <span className="text-sm text-gray-600">{t('backedByPyetDoktorin')}</span>
            </li>
            <li className="flex flex-col items-start">
              <span className="font-semibold text-gray-900 mb-1">{t('yourOnlineClinic')}</span>
              <span className="text-sm text-gray-600">{t('usePyetDoktorinDigital')}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

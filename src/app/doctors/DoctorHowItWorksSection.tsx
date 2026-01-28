import { useTranslation } from 'react-i18next';
import { UserPlusIcon, InboxArrowDownIcon, VideoCameraIcon, CurrencyEuroIcon, LifebuoyIcon } from '@heroicons/react/24/solid';

export default function DoctorHowItWorksSection() {
  const { t } = useTranslation();
  
  const steps = [
    {
      icon: UserPlusIcon,
      label: t('registerCompleteProfile'),
    },
    {
      icon: InboxArrowDownIcon,
      label: t('receiveAppointmentRequests'),
    },
    {
      icon: VideoCameraIcon,
      label: t('consultWithPatients'),
    },
    {
      icon: CurrencyEuroIcon,
      label: t('getPaidPerConsultation'),
    },
    {
      icon: LifebuoyIcon,
      label: t('accessSupportResources'),
    },
  ];

  return (
  <section className="bg-white p-0 mb-10 flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center py-8 px-2">
        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1 text-center">{t('howItWorks')}</h3>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">{t('startConsultingSimpleSteps')}</h2>
        <div className="relative w-full flex justify-center">
          {/* Line only on md+ screens */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-orange-100" style={{transform: 'translateY(-50%)'}} />
          <ol className="relative w-full flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2">
            {steps.map((step, idx) => (
              <li key={idx} className="flex flex-col items-center flex-1 min-w-[120px] w-full md:w-auto mb-6 md:mb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow text-lg font-extrabold text-orange-600 mb-2">
                  <step.icon className="h-6 w-6 text-orange-500" />
                </div>
                <span className="text-xs text-gray-700 leading-tight text-center font-medium">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm text-gray-600 mt-8 text-center max-w-xl">
          {t('joinPyetDoktorinSeamless')}
        </p>
        <a
          href="/register"
          className="mt-8 inline-block rounded-full bg-orange-600 px-8 py-4 text-base font-semibold text-white shadow hover:bg-orange-700 hover:text-white transition-colors text-center"
        >
          {t('registerNow')}
        </a>
      </div>
    </section>
  );
}

import { UserPlusIcon, CalendarDaysIcon, VideoCameraIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const steps = [
  { icon: UserPlusIcon, label: 'Sign up & create your profile' },
  { icon: CalendarDaysIcon, label: 'Book an appointment' },
  { icon: VideoCameraIcon, label: 'Consult with a doctor' },
  { icon: ChatBubbleLeftRightIcon, label: 'Chat & follow up' },
  { icon: ShieldCheckIcon, label: 'Access your health records' },
];

export default function IndividualHowItWorksSection() {
  return (
    <section className="w-full py-16 px-2 bg-white mb-12 flex items-center justify-center">
      <div className="max-w-5xl mx-auto flex flex-col items-center">
        <h3 className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1 text-center">How It Works</h3>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-8 text-center">Get started in a few easy steps</h2>
        <div className="relative w-full flex justify-center">
          {/* Line only on md+ screens */}
          <div className="hidden md:block absolute top-1/2 left-8 right-8 h-0.5 bg-orange-100 z-0" style={{transform: 'translateY(-50%)'}} />
          <ol className="relative w-full flex flex-col md:flex-row justify-between items-center gap-6 md:gap-2 z-10">
            {steps.map((step, idx) => (
              <li key={idx} className="flex flex-col items-center flex-1 min-w-[110px] w-full md:w-auto mb-6 md:mb-0">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow text-lg font-extrabold text-orange-600 mb-2 z-10">
                  <step.icon className="h-6 w-6 text-orange-500" />
                </div>
                <span className="text-xs text-gray-700 leading-tight text-center font-medium">{step.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="text-sm text-gray-600 mt-8 text-center max-w-xl">
          Experience seamless healthcare: register, book, consult, chat, and manage your health records—all in one place.
        </p>
      </div>
    </section>
  );
}

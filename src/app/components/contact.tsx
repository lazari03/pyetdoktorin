'use client';


import { useForm, FieldValues } from 'react-hook-form';
import 'react-phone-input-2/lib/style.css';
import heroSectionStrings from './heroSection.strings';



import { PaperAirplaneIcon, UserIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';

export default function ContactForm() {
  const { handleSubmit, register, reset } = useForm();
  const locale = 'en';
  const strings = heroSectionStrings[locale]?.contactSection || heroSectionStrings.en.contactSection;

  const onSubmit = async (data: FieldValues) => {
    try {
      const res = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert('Message sent successfully!');
        reset();
      } else {
        alert('Failed to send message. Please try again.');
      }
  } catch {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center py-16 px-2">
      <div className="relative w-full max-w-2xl mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-md p-0 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Icon/Illustration */}
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 w-1/2 p-10">
          <EnvelopeIcon className="w-24 h-24 text-orange-400 mb-6 drop-shadow-lg" />
          <h2 className="text-2xl font-bold text-orange-600 mb-2">{strings.title}</h2>
          <p className="text-base text-orange-500 text-center">{strings.subtitle}</p>
        </div>
        {/* Right: Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-md flex flex-col gap-5"
          >
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
              <input
                id="name"
                {...register('name', { required: true })}
                type="text"
                placeholder={strings.firstName}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/80 border border-orange-100 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base shadow-sm"
              />
            </div>
            <div className="relative">
              <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-300" />
              <input
                id="email"
                {...register('email', { required: true })}
                type="email"
                placeholder={strings.email}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white/80 border border-orange-100 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base shadow-sm"
              />
            </div>
            <div className="relative">
              <ChatBubbleLeftRightIcon className="absolute left-4 top-4 w-5 h-5 text-orange-300" />
              <textarea
                id="message"
                {...register('message', { required: true })}
                rows={4}
                placeholder={strings.message}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/80 border border-orange-100 text-gray-900 placeholder-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200 focus:outline-none text-base shadow-sm resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-white font-bold shadow-lg hover:from-orange-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-lg transition"
            >
              <PaperAirplaneIcon className="w-6 h-6 text-white -rotate-45" />
              {strings.sendMessage}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

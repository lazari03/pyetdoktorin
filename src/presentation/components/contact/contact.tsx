'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'react-phone-input-2/lib/style.css';
import { PaperAirplaneIcon, UserIcon, EnvelopeIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function ContactForm() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''}
      scriptProps={{ async: true, appendTo: 'head' }}
    >
      <ContactFormInner />
    </GoogleReCaptchaProvider>
  );
}

function ContactFormInner() {
  const { handleSubmit, register } = useForm();
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { executeRecaptcha } = useGoogleReCaptcha();
  const allowRecaptchaBypass =
    process.env.NODE_ENV !== 'production' ||
    process.env.NEXT_PUBLIC_RECAPTCHA_OPTIONAL === 'true';

  const onSubmit = handleSubmit(async (values) => {
    setStatus('sending');
    setErrorMsg('');
    try {
      let token: string | null = null;
      if (executeRecaptcha) {
        token = await executeRecaptcha('contact');
      }
      if (!token && !allowRecaptchaBypass) {
        setStatus('error');
        setErrorMsg(t('recaptchaUnavailable'));
        return;
      }
      const res = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          subject: values.subject,
          message: values.message,
          source: 'contact_component',
          token,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.message || t('failedToSendMessage'));
        return;
      }
      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMsg(t('failedToSendMessage'));
    }
  });

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center py-16 px-2 bg-gradient-to-br from-[#ede9fe] to-[#c7d2fe]">
      <div className="w-full max-w-4xl mx-auto rounded-3xl shadow-xl bg-white/90 backdrop-blur-md p-0 overflow-hidden flex flex-col md:flex-row">
        {/* Left: Info Panel */}
        <div className="md:w-1/3 w-full bg-gradient-to-br from-purple-400 to-purple-500 text-white flex flex-col justify-between p-8 gap-8 relative">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">{t('getInTouch')}</h2>
            <p className="text-base opacity-90 mb-6">{t('getInTouchSubtitle')}</p>
            <div className="flex flex-col gap-4 text-base">
              <div className="flex items-center gap-3"><UserIcon className="w-5 h-5" /> +355 68 123 4567</div>
              <div className="flex items-center gap-3"><EnvelopeIcon className="w-5 h-5" /> atelemedicine30@gmail.com</div>
              <div className="flex items-center gap-3"><ChatBubbleLeftRightIcon className="w-5 h-5" /> Tirana, Albania</div>
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl opacity-60 pointer-events-none" />
        </div>
        {/* Right: Form */}
        <div className="md:w-2/3 w-full flex flex-col justify-center items-center p-8">
          <form onSubmit={onSubmit} className="w-full flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('yourName')}</label>
                <input id="name" {...register('name', { required: true })} type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-purple-100 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-base shadow-sm" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">{t('yourEmail')}</label>
                <input id="email" {...register('email', { required: true })} type="email" placeholder="john@email.com" className="w-full px-4 py-3 rounded-lg border border-purple-100 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-base shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('yourSubject') || 'Subject'}</label>
              <input id="subject" {...register('subject')} type="text" placeholder={t('yourSubject') || 'Subject'} className="w-full px-4 py-3 rounded-lg border border-purple-100 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-base shadow-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t('message')}</label>
              <textarea id="message" {...register('message', { required: true })} rows={4} placeholder={t('yourMessage')} className="w-full px-4 py-3 rounded-lg border border-purple-100 text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:outline-none text-base shadow-sm resize-none" />
            </div>
            {status === 'error' && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {errorMsg}
              </div>
            )}
            {status === 'success' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {t('messageSent')}
              </div>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full md:w-1/3 mx-auto rounded-lg bg-gradient-to-r from-purple-500 to-purple-400 px-6 py-3 text-white font-bold shadow-lg hover:from-purple-600 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 text-lg transition flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <PaperAirplaneIcon className="w-6 h-6 text-white -rotate-45" />
              {status === 'sending' ? t('sending') : t('sendMessage')}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

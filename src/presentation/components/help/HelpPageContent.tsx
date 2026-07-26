'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreditCardIcon, VideoCameraIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useSupportTickets } from '@/presentation/hooks/useSupportTickets';
import type { CreateSupportTicketInput, SupportTicketStatus } from '@/application/ports/ISupportTicketService';

const CATEGORIES = [
  { slug: 'booking', icon: CreditCardIcon, titleKey: 'helpCategoryBooking', faqIds: [1, 2, 3, 8] },
  { slug: 'care', icon: VideoCameraIcon, titleKey: 'helpCategoryCare', faqIds: [4, 6] },
  { slug: 'account', icon: UserCircleIcon, titleKey: 'helpCategoryAccount', faqIds: [5, 7, 9] },
] as const;

function statusPill(status: SupportTicketStatus, t: (k: string) => string) {
  if (status === 'resolved') return { label: t('ticketStatusResolved') || 'Resolved', cls: 'bg-green-50 text-green-700' };
  if (status === 'in_progress') return { label: t('ticketStatusInProgress') || 'In progress', cls: 'bg-sky-50 text-sky-700' };
  return { label: t('ticketStatusOpen') || 'Open', cls: 'bg-amber-50 text-amber-700' };
}

function FaqItem({
  question,
  answer,
  topics,
  submitting,
  submit,
}: {
  question: string;
  answer: string;
  topics: string[];
  submitting: boolean;
  submit: (input: CreateSupportTicketInput) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [answered, setAnswered] = useState<'yes' | 'no' | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitError, setSubmitError] = useState(false);
  const [sent, setSent] = useState(false);

  const handleNo = () => {
    setAnswered('no');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !message.trim()) return;
    setSubmitError(false);
    const ok = await submit({ topic, subject: question, message: message.trim() });
    if (ok) {
      setShowForm(false);
      setMessage('');
      setSent(true);
    } else {
      setSubmitError(true);
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
        data-analytics="help.faq.toggle"
        aria-expanded={open}
      >
        <span className="text-[13px] font-semibold text-gray-900">{question}</span>
        <span className={`shrink-0 text-purple-600 text-lg leading-none transition-transform ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="pb-4 -mt-1">
          <p className="text-[12.5px] leading-relaxed text-gray-600 whitespace-pre-line">{answer}</p>

          {sent && (
            <div className="mt-3 rounded-2xl bg-green-50 border border-green-100 px-3.5 py-2.5 text-[12px] text-green-800">
              {t('helpTicketSent') || "Thanks — we've received your message and will get back to you by email."}
            </div>
          )}

          {!showForm ? (
            answered === 'yes' ? (
              <p className="mt-2.5 text-[11px] text-green-700">{t('helpGladItHelped') || 'Glad that helped.'}</p>
            ) : !sent ? (
              <div className="mt-2.5 flex items-center gap-2 text-[11px] text-gray-400">
                <span>{t('helpWasThisHelpful') || 'Did this answer your question?'}</span>
                <button
                  type="button"
                  onClick={() => setAnswered('yes')}
                  className="font-semibold text-gray-500 hover:text-gray-700"
                  data-analytics="help.faq.helpful_yes"
                >
                  {t('yes') || 'Yes'}
                </button>
                <span className="text-gray-300">·</span>
                <button
                  type="button"
                  onClick={handleNo}
                  className="font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                  data-analytics="help.faq.helpful_no"
                >
                  {t('helpNoSendMessage') || 'No, send a message'}
                </button>
              </div>
            ) : null
          ) : (
            <form onSubmit={handleSubmit} className="mt-3 rounded-2xl bg-gray-50 border border-gray-100 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[12.5px] font-semibold text-gray-900">{t('helpContactSupport') || 'Send us a message'}</h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-[11px] font-semibold text-gray-400 hover:text-gray-600"
                >
                  {t('cancel') || 'Cancel'}
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">{t('helpTopicLabel') || 'Topic'}</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-[12.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                >
                  <option value="" disabled>{t('helpTopicPlaceholder') || 'Choose a topic'}</option>
                  {topics.map((topicLabel) => (
                    <option key={topicLabel} value={topicLabel}>{topicLabel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-600 mb-1">{t('helpMessageLabel') || 'Message'}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={3}
                  maxLength={5000}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[12.5px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-y"
                />
              </div>
              {submitError ? (
                <p className="text-[11px] text-red-600">
                  {t('helpTicketSubmitFailed') || 'Could not send your message. Please try again.'}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={submitting || !topic || !message.trim()}
                className="w-full inline-flex items-center justify-center rounded-full bg-purple-600 px-4 py-1.5 text-[12.5px] font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                data-analytics="help.contact_support.submit"
              >
                {submitting ? t('sending') || 'Sending…' : t('helpSend') || 'Send'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export function HelpPageContent() {
  const { t } = useTranslation();
  const { tickets, loading, submitting, submit } = useSupportTickets();

  const topics = [
    t('helpTopicBooking') || 'Booking an appointment',
    t('helpTopicPayment') || 'Payment or refund',
    t('helpTopicVideo') || 'Video consultation',
    t('helpTopicPrescription') || 'Prescription',
    t('helpTopicAccount') || 'Account or profile',
    t('helpTopicOther') || 'Something else',
  ];

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
          {t('helpEyebrow') || 'Support'}
        </p>
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">{t('help') || 'Help'}</h1>
        <p className="text-sm text-gray-600">
          {t('helpSubtitle') || 'Find an answer below, or send us a message if you still need a hand.'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        <aside className="order-2 lg:order-1 lg:w-64 shrink-0 lg:sticky lg:top-4 lg:self-start space-y-5">
          <nav className="bg-white rounded-3xl border border-purple-50 shadow-lg p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2 px-1">
              {t('helpOnThisPage') || 'On this page'}
            </p>
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
              {CATEGORIES.map(({ slug, icon: Icon, titleKey }) => (
                <li key={slug} className="shrink-0 lg:shrink">
                  <a
                    href={`#${slug}`}
                    className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[12.5px] font-medium text-gray-600 hover:text-purple-700 hover:bg-purple-50 transition-colors whitespace-nowrap"
                    data-analytics={`help.toc.${slug}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{t(titleKey)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">{t('helpMyTickets') || 'My messages'}</h2>
            {loading ? (
              <div className="space-y-2">
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
                <div className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="text-[12.5px] text-gray-500">{t('helpNoTickets') || "You haven't sent any messages yet."}</p>
            ) : (
              <div className="rounded-xl border border-gray-100 divide-y divide-gray-100">
                {tickets.map((ticket) => {
                  const pill = statusPill(ticket.status, t);
                  return (
                    <div key={ticket.id} className="px-3.5 py-2.5 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-gray-900 truncate">{ticket.subject}</p>
                        <p className="text-[10.5px] text-gray-500 mt-0.5">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold shrink-0 ${pill.cls}`}>
                        {pill.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="order-1 lg:order-2 min-w-0 flex-1 bg-white rounded-3xl border border-purple-50 shadow-lg divide-y divide-gray-100">
          {CATEGORIES.map(({ slug, icon: Icon, titleKey, faqIds }) => (
            <section key={slug} id={slug} className="p-5 scroll-mt-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600 shrink-0">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="text-[13.5px] font-bold text-gray-900">{t(titleKey)}</h2>
              </div>
              <div className="pl-9">
                {faqIds.map((n) => (
                  <FaqItem
                    key={n}
                    question={t(`appHelpFaq${n}Q`)}
                    answer={t(`appHelpFaq${n}A`)}
                    topics={topics}
                    submitting={submitting}
                    submit={submit}
                  />
                ))}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}

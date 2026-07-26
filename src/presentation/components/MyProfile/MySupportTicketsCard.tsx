'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useSupportTickets } from '@/presentation/hooks/useSupportTickets';
import type { SupportTicketStatus } from '@/application/ports/ISupportTicketService';

function statusPill(status: SupportTicketStatus, t: (k: string) => string) {
  if (status === 'resolved') return { label: t('ticketStatusResolved') || 'Resolved', cls: 'bg-green-50 text-green-700' };
  if (status === 'in_progress') return { label: t('ticketStatusInProgress') || 'In progress', cls: 'bg-sky-50 text-sky-700' };
  return { label: t('ticketStatusOpen') || 'Open', cls: 'bg-amber-50 text-amber-700' };
}

export function MySupportTicketsCard({ helpHref }: { helpHref: string }) {
  const { t } = useTranslation();
  const { tickets, loading } = useSupportTickets();
  const recent = tickets.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-purple-50 shadow-lg p-5 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-900">{t('helpMyTickets') || 'My messages'}</p>
        <Link href={helpHref} className="text-[11px] font-semibold text-purple-600 hover:text-purple-700">
          {t('help') || 'Help'}
        </Link>
      </div>
      {loading ? (
        <div className="h-10 rounded-xl bg-gray-100 animate-pulse" />
      ) : recent.length === 0 ? (
        <p className="text-xs text-gray-600">{t('helpNoTickets') || "You haven't sent any messages yet."}</p>
      ) : (
        <div className="space-y-2">
          {recent.map((ticket) => {
            const pill = statusPill(ticket.status, t);
            return (
              <div key={ticket.id} className="flex items-center justify-between gap-2 rounded-xl border border-gray-100 px-3 py-2">
                <span className="text-[12px] font-medium text-gray-800 truncate">{ticket.subject}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold shrink-0 ${pill.cls}`}>
                  {pill.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { ADMIN_PATHS } from '@/navigation/paths';
import { fetchSecurityLogs, type SecurityLogEntry } from '@/network/securityLogs';

type SecurityFilter = 'all' | 'session_established' | 'session_establishment_failed' | 'logout';

const FILTERS: SecurityFilter[] = [
  'all',
  'session_established',
  'session_establishment_failed',
  'logout',
];

function toIntlLocale(locale?: string) {
  return locale === 'al' ? 'sq-AL' : 'en-US';
}

function formatTimestamp(value: string | undefined, locale: string) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

function formatRole(role?: string) {
  if (!role) return '—';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function eventLabel(type: string, t: (key: string, options?: Record<string, unknown>) => string) {
  switch (type) {
    case 'session_established':
      return t('securityLogEventLogin', { defaultValue: 'Session established' });
    case 'session_establishment_failed':
      return t('securityLogEventLoginFailed', { defaultValue: 'Session failed' });
    case 'logout':
      return t('securityLogEventLogout', { defaultValue: 'Logged out' });
    case 'video_access_attempt':
      return t('securityLogEventVideoAccess', { defaultValue: 'Video access attempt' });
    default:
      return type.replaceAll('_', ' ');
  }
}

export default function AdminSecurityPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<SecurityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [filter, setFilter] = useState<SecurityFilter>('all');

  const intlLocale = toIntlLocale(i18n.resolvedLanguage);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSecurityLogs(100);
      setItems(response.items);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((item) => item.type === filter);
  }, [filter, items]);

  const stats = useMemo(() => {
    const successfulSessions = items.filter((item) => item.type === 'session_established' && item.success).length;
    const failedSessions = items.filter((item) => item.type === 'session_establishment_failed').length;
    const logouts = items.filter((item) => item.type === 'logout').length;
    const accounts = new Set(
      items
        .map((item) => item.accountEmail || item.userId)
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ).size;

    return [
      {
        label: t('securityLogTotalEvents', { defaultValue: 'Total events' }),
        value: items.length,
      },
      {
        label: t('securityLogSuccessfulSessions', { defaultValue: 'Successful sign-ins' }),
        value: successfulSessions,
      },
      {
        label: t('securityLogFailedSessions', { defaultValue: 'Failed attempts' }),
        value: failedSessions,
      },
      {
        label: t('securityLogDistinctAccounts', { defaultValue: 'Accounts seen' }),
        value: accounts,
      },
      {
        label: t('securityLogLogouts', { defaultValue: 'Logouts' }),
        value: logouts,
      },
    ];
  }, [items, t]);

  return (
    <RequestStateGate
      loading={loading && items.length === 0}
      error={error}
      onRetry={() => {
        void load();
      }}
      homeHref={ADMIN_PATHS.root}
      loadingLabel={t('loading', { defaultValue: 'Loading...' })}
      analyticsPrefix="admin.security_logs"
    >
      <div className="space-y-6">
        <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t('securityLogs', { defaultValue: 'Security logs' })}
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
            {t('securityLogsTitle', { defaultValue: 'Security activity' })}
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            {t('securityLogsSubtitle', {
              defaultValue:
                'Review sign-ins, failed session attempts, and logout events with account and network context.',
            })}
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-md border border-purple-50 p-5">
              <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-3xl shadow-lg border border-purple-50 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {t('securityLogsListTitle', { defaultValue: 'Latest events' })}
              </h2>
              <p className="text-sm text-gray-600">
                {t('securityLogsListSubtitle', {
                  defaultValue: 'IP and location are best-effort and depend on proxy headers being available.',
                })}
              </p>
            </div>
            <button type="button" className="btn btn-outline" onClick={() => void load()}>
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{t('refresh', { defaultValue: 'Refresh' })}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => {
              const active = filter === item;
              const label =
                item === 'all'
                  ? t('all', { defaultValue: 'All' })
                  : eventLabel(item, t);
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 px-4 py-6 text-center text-sm text-gray-500">
              {t('securityLogsEmpty', { defaultValue: 'No security events recorded yet.' })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const success = item.success;
                const accountName =
                  item.accountName ||
                  item.accountEmail ||
                  item.userId ||
                  t('reportUnknownActor', { defaultValue: 'Unknown actor' });
                return (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-gray-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {eventLabel(item.type, t)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimestamp(item.createdAt, intlLocale)}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          success
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {success
                          ? t('securityLogStatusSuccess', { defaultValue: 'Success' })
                          : t('securityLogStatusFailed', { defaultValue: 'Failed' })}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {t('securityLogAccount', { defaultValue: 'Account' })}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{accountName}</p>
                        <p className="mt-1 text-xs text-gray-600">
                          {t('email', { defaultValue: 'Email' })}: {item.accountEmail || '—'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('role', { defaultValue: 'Role' })}: {formatRole(item.role)}
                        </p>
                        <p className="text-xs text-gray-600 break-all">
                          {t('userId', { defaultValue: 'User ID' })}: <span className="font-mono">{item.userId || '—'}</span>
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {t('securityLogNetwork', { defaultValue: 'Network' })}
                        </p>
                        <p className="mt-1 text-xs text-gray-600 break-all">
                          {t('securityLogIpAddress', { defaultValue: 'IP address' })}: <span className="font-mono">{item.ipAddress || '—'}</span>
                        </p>
                        <p className="text-xs text-gray-600">
                          {t('securityLogLocation', { defaultValue: 'Location' })}: {item.location || '—'}
                        </p>
                        <p className="text-xs text-gray-600 break-all">
                          {t('securityLogRequest', { defaultValue: 'Request' })}: {item.requestMethod || '—'} {item.requestPath || ''}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.2fr]">
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {t('reason', { defaultValue: 'Reason' })}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {item.reason || '—'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-wide text-gray-500">
                          {t('securityLogUserAgent', { defaultValue: 'User agent' })}
                        </p>
                        <p className="mt-1 text-sm text-gray-700 break-words">
                          {item.userAgent || '—'}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </RequestStateGate>
  );
}

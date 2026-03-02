'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { DASHBOARD_PATHS } from '@/navigation/paths';

export default function DashboardNotFound() {
  const { t } = useTranslation();

  return (
    <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center p-6 sm:p-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 text-purple-700 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em]">
            {t('notFoundEyebrow')}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
            {t('notFoundTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl">
            {t('notFoundSubtitle')}
          </p>
	          <div className="flex flex-wrap gap-3">
	            <Link
	              href={DASHBOARD_PATHS.root}
	              className="inline-flex items-center justify-center rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition"
	            >
	              {t('backToDashboard')}
	            </Link>
	          </div>
        </div>
        <div className="relative w-full max-w-md justify-self-center">
          <Image
            src="/img/dashboard-404.svg"
            alt={t('notFoundTitle')}
            width={560}
            height={420}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
    </section>
  );
}

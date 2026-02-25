'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import WebsiteShell from '@/presentation/components/website/WebsiteShell';
import DashboardNotFound from './dashboard/not-found';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/domain/entities/UserRole';
import './styles.css';

export default function NotFound() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isAuthenticated, role } = useAuth();
  const isDashboardPath = pathname?.startsWith('/dashboard');
  const isDashboardRole = isAuthenticated && (role === UserRole.Doctor || role === UserRole.Patient);
  const showDashboard = Boolean(isDashboardPath || isDashboardRole);

  if (showDashboard) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <main className="flex-1 pt-14 md:pt-0 px-2 sm:px-4 md:px-8 lg:px-12 py-4 md:py-6 lg:py-8">
          <DashboardNotFound />
        </main>
      </div>
    );
  }

  return (
    <WebsiteShell>
      <section className="website-hero website-hero--contact">
        <div className="website-container website-hero-grid centered">
          <div className="website-hero-copy">
            <div className="website-pill">{t('notFoundEyebrow')}</div>
            <h1 className="website-hero-title">{t('notFoundTitle')}</h1>
            <p className="website-hero-subtitle">{t('notFoundSubtitle')}</p>
            <div className="website-hero-actions">
              <Link href="/" className="website-btn website-btn-solid">
                {t('notFoundPrimaryCta')}
              </Link>
              <Link href="/contact" className="website-btn website-btn-ghost">
                {t('notFoundSecondaryCta')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </WebsiteShell>
  );
}

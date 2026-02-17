'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import WebsiteShell from '@/presentation/components/website/WebsiteShell';
import './styles.css';

export default function NotFound() {
  const { t } = useTranslation();

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

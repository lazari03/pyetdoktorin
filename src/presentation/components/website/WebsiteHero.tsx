'use client';

import Image from 'next/image';
import Link from 'next/link';

type HeroCta = {
  label: string;
  href: string;
  variant?: 'solid' | 'ghost';
};

export default function WebsiteHero({
  eyebrow,
  title,
  highlight,
  subtitle,
  primaryCta,
  secondaryCta,
  imageSrc,
  imageAlt,
  variant = 'split',
  className = '',
  chip,
  metaText,
  floatingText,
  cardClassName = '',
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  subtitle: string;
  primaryCta: HeroCta;
  secondaryCta?: HeroCta;
  imageSrc?: string;
  imageAlt?: string;
  variant?: 'split' | 'centered';
  className?: string;
  chip?: string;
  metaText?: string;
  floatingText?: string;
  cardClassName?: string;
}) {
  return (
    <section className={`website-hero ${className}`.trim()}>
      <div className="website-container">
        <div className={`website-hero-grid ${variant === 'centered' || !imageSrc ? 'centered' : 'with-media'}`}>
          <div className="website-hero-copy">
            <div className="website-pill">{eyebrow}</div>
            <h1 className="website-hero-title">
              <span className="website-hero-title-main">{title}</span>
              {highlight && <span className="website-hero-highlight">{highlight}</span>}
            </h1>
            <p className="website-hero-subtitle">{subtitle}</p>
            <div className="website-hero-actions">
              <Link href={primaryCta.href} className="website-btn website-btn-solid">
                {primaryCta.label}
              </Link>
              {secondaryCta && (
                <Link href={secondaryCta.href} className="website-btn website-btn-ghost">
                  {secondaryCta.label}
                </Link>
              )}
            </div>
            {metaText && (
              <div className="website-hero-meta">
                <div className="website-avatars">
                  <Image src="/api/images?key=avatar1" alt="" width={28} height={28} className="website-avatar" />
                  <Image src="/api/images?key=avatar2" alt="" width={28} height={28} className="website-avatar" />
                  <Image src="/api/images?key=avatar3" alt="" width={28} height={28} className="website-avatar" />
                </div>
                <span className="website-hero-meta-text">{metaText}</span>
              </div>
            )}
          </div>
          {imageSrc && (
            <div className="website-hero-media">
              <div className={`website-hero-card ${cardClassName}`.trim()}>
                <Image
                  src={imageSrc}
                  alt={imageAlt || ''}
                  fill
                  sizes="(max-width: 768px) 320px, 420px"
                  className="website-hero-image"
                  unoptimized
                />
                {chip && <div className="website-hero-chip">{chip}</div>}
                {floatingText && (
                  <div className="website-hero-floating">
                    <span className="website-dot" />
                    <span>{floatingText}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { resolveWebsiteImageSrc, usesUnoptimizedImage } from '@/presentation/components/website/websiteImageCatalog';

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
  priority = false,
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
  priority?: boolean;
}) {
  const resolvedImageSrc = resolveWebsiteImageSrc(imageSrc);
  const usesSvgImage = usesUnoptimizedImage(resolvedImageSrc);
  const avatar1Src = resolveWebsiteImageSrc('/website/avatar1.svg') ?? '/website/avatar1.svg';
  const avatar2Src = resolveWebsiteImageSrc('/website/avatar2.svg') ?? '/website/avatar2.svg';
  const avatar3Src = resolveWebsiteImageSrc('/website/avatar3.svg') ?? '/website/avatar3.svg';

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
                  <Image src={avatar1Src} alt="" width={28} height={28} className="website-avatar" />
                  <Image src={avatar2Src} alt="" width={28} height={28} className="website-avatar" />
                  <Image src={avatar3Src} alt="" width={28} height={28} className="website-avatar" />
                </div>
                <span className="website-hero-meta-text">{metaText}</span>
              </div>
            )}
          </div>
          {resolvedImageSrc && (
            <div className="website-hero-media">
              <div className={`website-hero-card ${cardClassName}`.trim()}>
                <Image
                  src={resolvedImageSrc}
                  alt={imageAlt || ''}
                  fill
                  sizes="(max-width: 768px) 320px, 420px"
                  className="website-hero-image"
                  priority={priority}
                  unoptimized={usesSvgImage}
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

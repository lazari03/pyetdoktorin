'use client';

import Link from 'next/link';

export default function WebsiteCta({
  title,
  subtitle,
  primary,
  secondary,
}: {
  title: string;
  subtitle: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="website-cta">
      <div>
        <h2 className="website-section-title">{title}</h2>
        <p className="website-section-body">{subtitle}</p>
      </div>
      <div className="website-cta-actions">
        <Link href={primary.href} className="website-btn website-btn-solid">
          {primary.label}
        </Link>
        {secondary && (
          <Link href={secondary.href} className="website-btn website-btn-ghost">
            {secondary.label}
          </Link>
        )}
      </div>
    </div>
  );
}

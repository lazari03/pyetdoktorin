export default function WebsiteSection({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'alt' | 'noPadding';
}) {
  const base = 'website-section';
  const variantClass =
    variant === 'alt' ? 'website-section-alt' : variant === 'noPadding' ? 'website-section-nopad' : '';
  return <section className={[base, variantClass].filter(Boolean).join(' ')}>{children}</section>;
}

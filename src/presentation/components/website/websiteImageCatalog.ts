// ponytail: photos downloaded from Pexels into public/website — no runtime remote fetch
const WEBSITE_IMAGE_OVERRIDES: Record<string, string> = {
  '/website/home-hero-premium.svg': '/website/home-hero.jpg',
  '/website/home-care-premium.svg': '/website/home-care.jpg',
  '/website/hero1.svg': '/website/doctor-hero.jpg',
  '/website/dashboard.svg': '/website/dashboard-photo.jpg',
  '/website/child1.svg': '/website/home-care.jpg',
  '/website/avatar1.svg': '/website/avatar1.jpg',
  '/website/avatar2.svg': '/website/avatar2.jpg',
  '/website/avatar3.svg': '/website/avatar3.jpg',
};

export function resolveWebsiteImageSrc(src?: string): string | undefined {
  if (!src) return src;
  return WEBSITE_IMAGE_OVERRIDES[src] ?? src;
}

export function usesUnoptimizedImage(src?: string): boolean {
  return (src?.split('?')[0] ?? '').endsWith('.svg');
}

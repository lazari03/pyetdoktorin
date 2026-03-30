const WEBSITE_IMAGE_OVERRIDES: Record<string, string> = {
  '/website/home-hero-premium.svg':
    'https://images.pexels.com/photos/7195308/pexels-photo-7195308.jpeg?cs=srgb&dl=pexels-karola-g-7195308.jpg&fm=jpg',
  '/website/home-care-premium.svg':
    'https://images.pexels.com/photos/8376177/pexels-photo-8376177.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-8376177.jpg&fm=jpg',
  '/website/hero1.svg':
    'https://images.pexels.com/photos/8376243/pexels-photo-8376243.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-8376243.jpg&fm=jpg',
  '/website/dashboard.svg':
    'https://images.pexels.com/photos/8376212/pexels-photo-8376212.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-8376212.jpg&fm=jpg',
  '/website/child1.svg':
    'https://images.pexels.com/photos/8376177/pexels-photo-8376177.jpeg?cs=srgb&dl=pexels-tima-miroshnichenko-8376177.jpg&fm=jpg',
  '/website/avatar1.svg':
    'https://images.pexels.com/photos/32428850/pexels-photo-32428850.jpeg?cs=srgb&dl=pexels-drharorswellness-32428850.jpg&fm=jpg',
  '/website/avatar2.svg':
    'https://images.pexels.com/photos/17829429/pexels-photo-17829429.jpeg?cs=srgb&dl=pexels-tessy-agbonome-521343232-17829429.jpg&fm=jpg',
  '/website/avatar3.svg':
    'https://images.pexels.com/photos/5722163/pexels-photo-5722163.jpeg?cs=srgb&dl=pexels-cottonbro-5722163.jpg&fm=jpg',
};

export function resolveWebsiteImageSrc(src?: string): string | undefined {
  if (!src) return src;
  return WEBSITE_IMAGE_OVERRIDES[src] ?? src;
}

export function usesUnoptimizedImage(src?: string): boolean {
  return (src?.split('?')[0] ?? '').endsWith('.svg');
}

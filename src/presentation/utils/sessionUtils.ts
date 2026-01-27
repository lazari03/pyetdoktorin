// src/domain/sessionUtils.ts

export function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secureAttr = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureAttr}`;
}

export function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; Max-Age=0`;
}

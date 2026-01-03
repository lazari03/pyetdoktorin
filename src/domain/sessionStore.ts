import { create } from 'zustand';
import { getAuth, signOut } from 'firebase/auth';

// 30 minutes idle timeout
const IDLE_MS = 30 * 60 * 1000;
const REFRESH_THROTTLE_MS = 60 * 1000; // 1 minute

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secureAttr = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}${secureAttr}`;
}

function getCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; Max-Age=0`;
}

interface SessionState {
  isMonitoring: boolean;
  lastActivity: number | null;
  idleMs: number;
  _intervalId: number | null;
  _lastRefresh: number;
  _stopFn?: () => void;
  initMonitor: () => void;
  stopMonitor: () => void;
  touchActivity: () => void;
  refreshSlidingCookies: () => void;
  logoutForIdle: () => void;
  logout: (reason?: string) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isMonitoring: false,
  lastActivity: null,
  idleMs: IDLE_MS,
  _intervalId: null,
  _lastRefresh: 0,

  initMonitor: () => {
    if (typeof window === 'undefined') return;
    if (get().isMonitoring) return;

    const maxAgeSeconds = Math.floor(get().idleMs / 1000);

    const refresh = () => {
      const now = Date.now();
      if (now - get()._lastRefresh < REFRESH_THROTTLE_MS) return;
      set({ _lastRefresh: now, lastActivity: now });

      // Update lastActivity and refresh auth cookies expiry (sliding window)
      setCookie('lastActivity', String(now), maxAgeSeconds);
      // Refresh lightweight client cookies; HttpOnly session is extended by middleware on requests
      const loggedIn = getCookie('loggedIn');
      if (loggedIn) setCookie('loggedIn', '1', maxAgeSeconds);
      const role = getCookie('userRole');
      if (role) setCookie('userRole', role, maxAgeSeconds);
    };

    const handleActivity = () => {
      refresh();
    };

    const windowEvents: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
    ];
    const documentEvents: Array<keyof DocumentEventMap> = ['visibilitychange'];

    windowEvents.forEach((evt) => window.addEventListener(evt, handleActivity as EventListener, { passive: true }));
    documentEvents.forEach((evt) => document.addEventListener(evt, handleActivity as EventListener, { passive: true }));

    // Prime cookies on start
    refresh();

    const id = window.setInterval(() => {
      const { idleMs } = get();
      const last = Number(getCookie('lastActivity')) || 0;
      const inactive = Date.now() - last > idleMs;
      if (inactive) {
        get().logoutForIdle();
      }
    }, 30 * 1000);

    set({ isMonitoring: true, _intervalId: id });

    // Store a stop function bound to this closure
    const stop = () => {
      windowEvents.forEach((evt) => window.removeEventListener(evt, handleActivity as EventListener));
      documentEvents.forEach((evt) => document.removeEventListener(evt, handleActivity as EventListener));
      const currentId = get()._intervalId;
      if (currentId !== null) {
        window.clearInterval(currentId);
      }
      set({ isMonitoring: false, _intervalId: null });
    };

    // Attach stop to state so stopMonitor can call it
    set({ _stopFn: stop });
  },

  stopMonitor: () => {
    const stop = get()._stopFn;
    if (typeof stop === 'function') {
      stop();
      set({ _stopFn: undefined });
    }
  },

  touchActivity: () => {
    const maxAgeSeconds = Math.floor(get().idleMs / 1000);
    const now = Date.now();
    set({ lastActivity: now });
    setCookie('lastActivity', String(now), maxAgeSeconds);
  },

  refreshSlidingCookies: () => {
    const maxAgeSeconds = Math.floor(get().idleMs / 1000);
    const loggedIn = getCookie('loggedIn');
    if (loggedIn) setCookie('loggedIn', '1', maxAgeSeconds);
    const role = getCookie('userRole');
    if (role) setCookie('userRole', role, maxAgeSeconds);
  },

  logoutForIdle: () => {
    try {
      const auth = getAuth();
      signOut(auth).catch(() => {});
    } catch {}
    // HttpOnly session is cleared by middleware or via API logout; clear client-visible helpers
    deleteCookie('userRole');
    deleteCookie('lastActivity');
    deleteCookie('loggedIn');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login?reason=idle-timeout';
    }
  },
  logout: (reason?: string) => {
    try {
      const auth = getAuth();
      signOut(auth).catch(() => {});
    } catch {}
    // Ask server to clear HttpOnly cookie
    if (typeof fetch !== 'undefined') {
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    }
    deleteCookie('userRole');
    deleteCookie('lastActivity');
    deleteCookie('loggedIn');
    if (typeof window !== 'undefined') {
      const suffix = reason ? `?reason=${encodeURIComponent(reason)}` : '';
      window.location.href = `/login${suffix}`;
    }
  },
}));

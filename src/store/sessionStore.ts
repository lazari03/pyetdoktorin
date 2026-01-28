import { create } from 'zustand';
import { LogoutSessionUseCase } from '../application/logoutSessionUseCase';
import { LogoutServerUseCase } from '@/application/logoutServerUseCase';
import { setCookie, getCookie, deleteCookie } from '@/presentation/utils/sessionUtils';

// 30 minutes idle timeout
const IDLE_MS = 30 * 60 * 1000;
const REFRESH_THROTTLE_MS = 60 * 1000; // 1 minute



interface SessionState {
  isMonitoring: boolean;
  lastActivity: number | null;
  idleMs: number;
  _intervalId: number | null;
  _lastRefresh: number;
  _stopFn?: () => void;
  initMonitor: (logoutSessionUseCase: LogoutSessionUseCase) => void;
  stopMonitor: () => void;
  touchActivity: () => void;
  refreshSlidingCookies: () => void;
  logoutForIdle: (logoutSessionUseCase: LogoutSessionUseCase) => void;
  logout: (reason?: string, logoutSessionUseCase?: LogoutSessionUseCase, logoutServerUseCase?: LogoutServerUseCase) => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  isMonitoring: false,
  lastActivity: null,
  idleMs: IDLE_MS,
  _intervalId: null,
  _lastRefresh: 0,

  initMonitor: (logoutSessionUseCase: LogoutSessionUseCase) => {
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
        get().logoutForIdle(logoutSessionUseCase);
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

  logoutForIdle: (logoutSessionUseCase: LogoutSessionUseCase) => {
    logoutSessionUseCase.execute();
    // HttpOnly session is cleared by middleware or via API logout; clear client-visible helpers
    deleteCookie('userRole');
    deleteCookie('lastActivity');
    deleteCookie('loggedIn');
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login?reason=idle-timeout';
    }
  },
  logout: async (reason?: string, logoutSessionUseCase?: LogoutSessionUseCase, logoutServerUseCase?: LogoutServerUseCase) => {
    if (logoutSessionUseCase) logoutSessionUseCase.execute();
    // Ask server to clear HttpOnly cookie via network layer
    if (logoutServerUseCase) {
      try {
        await logoutServerUseCase.execute();
      } catch {}
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

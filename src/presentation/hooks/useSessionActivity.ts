import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';

// Thin hook that delegates all logic to the centralized Zustand store.
// Only monitors while `enabled` (i.e. the user is authenticated) so anonymous
// visitors on login/register pages are never "idle logged out".
export function useSessionActivity(
  logoutSessionUseCase: LogoutSessionUseCase,
  enabled = true,
  renewSession?: () => Promise<void>,
) {
  const init = useSessionStore((s) => s.initMonitor);
  const stop = useSessionStore((s) => s.stopMonitor);

  useEffect(() => {
    if (!enabled) return;
    init(logoutSessionUseCase, renewSession);
    return () => stop();
  }, [init, stop, logoutSessionUseCase, enabled, renewSession]);
}

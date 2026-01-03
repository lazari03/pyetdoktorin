import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';

// Thin hook that delegates all logic to the centralized Zustand store
export function useSessionActivity(logoutSessionUseCase: LogoutSessionUseCase) {
  const init = useSessionStore((s) => s.initMonitor);
  const stop = useSessionStore((s) => s.stopMonitor);

  useEffect(() => {
    init(logoutSessionUseCase);
    return () => stop();
  }, [init, stop, logoutSessionUseCase]);
}

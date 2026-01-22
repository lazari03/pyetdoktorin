import { useEffect } from 'react';
import { useSessionStore } from '@/store/sessionStore';
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';

export function useSessionActivity(logoutSessionUseCase: LogoutSessionUseCase) {
  const init = useSessionStore((s) => s.initMonitor);
  const stop = useSessionStore((s) => s.stopMonitor);

  useEffect(() => {
    init(logoutSessionUseCase);
    return () => stop();
  }, [init, stop, logoutSessionUseCase]);
}

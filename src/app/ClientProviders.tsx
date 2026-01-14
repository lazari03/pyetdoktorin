'use client';
import "@/i18n/i18n";
import { AuthProvider } from "../context/AuthContext";
import { useSessionActivity } from "@/hooks/useSessionActivity";
import { LogoutSessionUseCase } from '@/application/logoutSessionUseCase';
import { FirebaseSessionRepository } from '@/infrastructure/repositories/FirebaseSessionRepository';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const sessionRepo = new FirebaseSessionRepository();
    const logoutSessionUseCase = new LogoutSessionUseCase(sessionRepo);
    useSessionActivity(logoutSessionUseCase);
    // nothing to render
    return null;
  }

  return (
    <AuthProvider>
      <SessionActivityHost />
      {children}
    </AuthProvider>
  );
}

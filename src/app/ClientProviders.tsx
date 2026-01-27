'use client';
import "@/i18n/i18n";
import { AuthProvider } from "../context/AuthContext";
import { useSessionActivity } from "@/presentation/hooks/useSessionActivity";
import { useDI } from "@/context/DIContext";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // Mount global idle/session activity tracker once on client
  function SessionActivityHost() {
    const { logoutSessionUseCase } = useDI();
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

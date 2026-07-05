'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { fetchCurrentUserProfile } from '@/network/currentUser';
import { useDI } from '@/context/DIContext';
import { setAuthToken } from '@/infrastructure/auth/tokenHolder';

interface AuthContextType {
  isAuthenticated: boolean;
  uid: string | null; // Add `uid` property
  user: { uid: string; name: string; email?: string; phoneNumber?: string } | null;
  emailVerified: boolean;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  uid: null, 
  user: null,
  emailVerified: false,
  role: null, // Set default to null
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { authService } = useDI();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<{ uid: string; name: string; email?: string; phoneNumber?: string } | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;

    const unsubToken = authService.observeIdToken((token) => {
      setAuthToken(token);
    });

    const unsubscribe = authService.observeAuthState(async (authState) => {
      if (cancel) return;

      if (authState.userId) {
        let resolvedEmailVerified = authService.isEmailVerified();
        try {
          if (!resolvedEmailVerified) {
            resolvedEmailVerified = await authService.reloadUser();
          }
        } catch {
          // ignore reload failures
        }

        const currentUserInfo = authService.getCurrentUserInfo();

        setIsAuthenticated(true);
        setUid(authState.userId);
        setEmailVerified(resolvedEmailVerified);
        try {
          const userData = await fetchCurrentUserProfile();
          const normalizedRole = normalizeRole(userData.role);
          setRole(normalizedRole);
          setUser({
            uid: authState.userId,
            name: userData.name || currentUserInfo?.displayName || 'Unknown',
            email: userData.email || currentUserInfo?.email || undefined,
            phoneNumber: userData.phoneNumber || currentUserInfo?.phoneNumber || undefined,
          });
          setEmailVerified(
            typeof userData.emailVerified === 'boolean'
              ? userData.emailVerified
              : resolvedEmailVerified,
          );
        } catch {
          setRole(null);
          setUser(null);
          setEmailVerified(resolvedEmailVerified);
        }
      } else {
        setIsAuthenticated(false);
        setUid(null);
        setUser(null);
        setRole(null);
        setEmailVerified(false);
      }

      if (!cancel) setLoading(false);
    });

    return () => {
      cancel = true;
      unsubscribe();
      unsubToken();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, uid, user, emailVerified, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

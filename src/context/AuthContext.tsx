'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { useDI } from '@/context/DIContext';
import { useCurrentUserProfile } from '@/presentation/hooks/useCurrentUserProfile';

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
  const [firebaseEmailVerified, setFirebaseEmailVerified] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.observeFullAuthState((firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUid(firebaseUser.uid);
        setFirebaseEmailVerified(firebaseUser.emailVerified);
      } else {
        setIsAuthenticated(false);
        setUid(null);
        setFirebaseEmailVerified(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile(isAuthenticated ? uid : null);

  const role = profile ? normalizeRole(profile.role) : null;
  const user = profile && uid
    ? {
        uid,
        name: profile.name || 'Unknown',
        email: profile.email,
        phoneNumber: profile.phoneNumber,
      }
    : null;
  const emailVerified = typeof profile?.emailVerified === 'boolean' ? profile.emailVerified : firebaseEmailVerified;
  const loading = authLoading || (isAuthenticated && profileLoading);

  return (
    <AuthContext.Provider value={{ isAuthenticated, uid, user, emailVerified, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

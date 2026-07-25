'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { useDI } from '@/context/DIContext';
import { useCurrentUserProfile } from '@/presentation/hooks/useCurrentUserProfile';
import { setAuthToken } from '@/application/auth/tokenHolder';

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

  useEffect(() => {
    // Keeps the shared token cache (tokenHolder) in sync so backendFetch can
    // attach a bearer token immediately instead of depending solely on the
    // session cookie — this was previously wired up (port + adapter both
    // exist) but never actually subscribed to anywhere, so every request
    // silently fell back to cookie-only auth after a dead 3s wait.
    const unsubscribe = authService.observeIdToken((token) => {
      setAuthToken(token);
    });
    return () => unsubscribe();
  }, [authService]);

  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile(isAuthenticated ? uid : null);

  const role = profile ? normalizeRole(profile.role) : null;
  const hasProfile = Boolean(profile);
  const profileName = profile?.name;
  const profileEmail = profile?.email;
  const profilePhoneNumber = profile?.phoneNumber;

  // Memoized on the actual primitive fields, not on `profile` object identity
  // — SWR hands back a freshly-parsed object on every revalidation even when
  // nothing changed, and an unmemoized `user` here previously caused every
  // consumer's `useEffect(..., [user])` to re-fire on every AuthContext
  // render, which cascaded into a "Maximum update depth exceeded" render
  // loop. `hasProfile` (not `profile`) is deliberate: including the object
  // itself would defeat this by changing on every revalidation too.
  const user = useMemo(
    () =>
      hasProfile && uid
        ? {
            uid,
            name: profileName || 'Unknown',
            email: profileEmail,
            phoneNumber: profilePhoneNumber,
          }
        : null,
    [uid, hasProfile, profileName, profileEmail, profilePhoneNumber],
  );
  const emailVerified = typeof profile?.emailVerified === 'boolean' ? profile.emailVerified : firebaseEmailVerified;
  const loading = authLoading || (isAuthenticated && profileLoading);

  const value = useMemo(
    () => ({ isAuthenticated, uid, user, emailVerified, role, loading }),
    [isAuthenticated, uid, user, emailVerified, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';
import { useDI } from '@/context/DIContext';

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
    const unsubscribe = authService.observeFullAuthState(async (firebaseUser) => {
      if (firebaseUser) {
        setIsAuthenticated(true);
        setUid(firebaseUser.uid);
        setEmailVerified(firebaseUser.emailVerified);
        try {
          const userData = await authService.fetchCurrentUser();
          const normalizedRole = normalizeRole(userData.role);
          setRole(normalizedRole);
          setUser({
            uid: firebaseUser.uid,
            name: userData.name || firebaseUser.displayName || 'Unknown',
            email: userData.email || firebaseUser.email || undefined,
            phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber || undefined,
          });
          setEmailVerified(
            typeof userData.emailVerified === 'boolean'
              ? userData.emailVerified
              : firebaseUser.emailVerified,
          );
        } catch {
          setRole(null);
          setUser(null);
          setEmailVerified(firebaseUser.emailVerified);
        }
      } else {
        setIsAuthenticated(false);
        setUid(null);
        setUser(null);
        setRole(null);
        setEmailVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, uid, user, emailVerified, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig'; // Import your Firestore config
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';

interface AuthContextType {
  isAuthenticated: boolean;
  uid: string | null; // Add `uid` property
  user: { uid: string; name: string; email?: string; phoneNumber?: string } | null;
  role: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  uid: null, 
  user: null,
  role: null, // Set default to null
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null); // Add state for `uid`
  const [user, setUser] = useState<{ uid: string; name: string; email?: string; phoneNumber?: string } | null>(null);
  const [role, setRole] = useState<UserRole | null>(null); // Fix type here
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {

      if (currentUser) {
        setIsAuthenticated(true);
        setUid(currentUser.uid); // Set `uid`
        try {
          // Fetch the user's role from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const normalizedRole = normalizeRole(userData.role);
            setRole(normalizedRole);
            setUser({
              uid: currentUser.uid,
              name: userData.name || currentUser.displayName || 'Unknown',
              email: currentUser.email || userData.email,
              phoneNumber: currentUser.phoneNumber || userData.phoneNumber,
            });
          } else {

            setRole(null);
            setUser(null);
          }
        } catch {
          setRole(null);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUid(null); // Reset `uid`
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, uid, user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

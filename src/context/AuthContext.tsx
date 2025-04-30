'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig'; // Import your Firestore config
import { UserRole } from '@/models/UserRole';

interface AuthContextType {
  isAuthenticated: boolean;
  uid: string | null; // Add `uid` property
  user: { uid: string; name: string } | null;
  role: UserRole | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  uid: null, 
  user: null,
  role: UserRole.null, // Default role
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uid, setUid] = useState<string | null>(null); // Add state for `uid`
  const [user, setUser] = useState<{ uid: string; name: string } | null>(null);
  const [role, setRole] = useState<UserRole.null | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed:', currentUser); // Debugging log

      if (currentUser) {
        setIsAuthenticated(true);
        setUid(currentUser.uid); // Set `uid`
        try {
          // Fetch the user's role from Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role || null;
            setRole(role); // Set the user's role
            localStorage.setItem('userRole', role); // Store the role in localStorage
            setUser({ uid: currentUser.uid, name: userData.name || 'Unknown' }); // Ensure name is set
          } else {
            console.error('User document not found in Firestore');
            setRole(null);
            localStorage.removeItem('userRole'); // Remove role if not found
            setUser(null);
          }
        } catch (error) {
          console.error('Failed to fetch user role from Firestore:', error);
          setRole(null);
          localStorage.removeItem('userRole'); // Remove role on error
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUid(null); // Reset `uid`
        setUser(null);
        setRole(null);
        localStorage.removeItem('userRole'); // Clear role on logout
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
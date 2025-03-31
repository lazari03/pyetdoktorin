import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebaseconfig';

// Centralized authentication service

// Check if user is authenticated
export const isAuthenticated = (callback: (authState: { userId: string | null; error: string | null }) => void) => {
    const authInstance = getAuth();
    onAuthStateChanged(authInstance, (user) => {
        if (user) {
            callback({ userId: user.uid, error: null });
        } else {
            callback({ userId: null, error: 'User not authenticated. Please log in.' });
        }
    });
};

// Login function
export const login = async (email: string, password: string) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? userDoc.data()?.role || 'patient' : 'patient';

        // Get ID token for cookie-based auth
        const token = await user.getIdToken();
        console.log('Token obtained successfully');

        // Set the auth token as a session cookie
        document.cookie = `auth-token=${token}; path=/; SameSite=Lax`;
        console.log('Auth token cookie set:', document.cookie);

        return { user, role };
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Failed to log in');
    }
};

// Register function
export const register = async (email: string, password: string, role: string, formData: any) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save user role and additional data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            role,
            ...formData,
        });

        return { user, role };
    } catch (error) {
        console.error('Error during registration:', error);
        throw new Error('Failed to register');
    }
};

// Logout function
export const logout = async () => {
    try {
        await signOut(auth);
        console.log('User signed out successfully');
    } catch (error) {
        console.error('Error signing out:', error);
        throw new Error('Failed to sign out');
    }
};
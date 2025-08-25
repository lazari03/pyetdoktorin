import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebaseconfig';

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

        // Set the auth token as a session cookie
        document.cookie = `auth-token=${token}; path=/; SameSite=Lax; expires=Session`;
        // Set the userRole cookie for middleware
        document.cookie = `userRole=${role}; path=/; SameSite=Lax; expires=Session`;

        return { user, role };
    } catch {
        throw new Error('Failed to log in');
    }
};

// Fetch user details function
export async function fetchUserDetails(userId: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data(); // Return user details
        } else {

            return null;
        }
    } catch {
        return null;
    }
}
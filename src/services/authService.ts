import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
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
        console.log('Token obtained successfully');

        // Set the auth token as a session cookie
        document.cookie = `auth-token=${token}; path=/; SameSite=Lax; expires=Session`;
        // Set the userRole cookie for middleware
        document.cookie = `userRole=${role}; path=/; SameSite=Lax; expires=Session`;
        console.log('Auth token cookie set:', document.cookie);

        return { user, role };
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Failed to log in');
    }
};

// Define a type for formData
interface FormData {
    [key: string]: unknown; // Allow additional fields with unknown types
}

// Register function
const register = async (email: string, password: string, role: string, formData: FormData) => { // Replace `any` with `FormData`
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
const logout = async () => {
    try {
        await signOut(auth);
        console.log('User signed out successfully');

        // Clear the auth token cookie
        document.cookie = 'auth-token=; path=/; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        // Clear the userRole cookie
        document.cookie = 'userRole=; path=/; SameSite=Lax; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    } catch (error) {
        console.error('Error signing out:', error);
        throw new Error('Failed to sign out');
    }
};

// Fetch user details function
export async function fetchUserDetails(userId: string) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return userDoc.data(); // Return user details
        } else {
            console.error('User not found');
            return null;
        }
    } catch (error) {
        console.error('Error fetching user details:', error);
        return null;
    }
}
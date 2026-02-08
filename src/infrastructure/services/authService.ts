import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseconfig';

import { sendPasswordResetEmail } from "firebase/auth";

// Send password reset email
export async function resetUserPassword(email: string) {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch {
        throw new Error('Failed to send password reset email');
    }
}
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

        // Get ID token and send to server to create an HttpOnly session cookie
        const idToken = await user.getIdToken(true);
        const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        const sessionUrl = backendBaseUrl ? `${backendBaseUrl}/api/auth/session` : '/api/auth/session';
        const res = await fetch(sessionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ idToken }),
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('Session API error', res.status, body);
            throw new Error(body || 'Failed to establish session');
        }

        // Refresh token to pull updated custom claims (role/admin) after session is established
        try {
            await user.getIdToken(true);
        } catch (refreshError) {
            console.warn('Failed to refresh token after session setup', refreshError);
        }

        return { user, role };
    } catch (error) {
        console.error('Login error:', error); // Log the actual error object
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

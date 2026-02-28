import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, updateEmail } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseconfig';
import { UserRole } from '@/domain/entities/UserRole';
import { normalizeRole } from '@/domain/rules/userRules';

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
export const login = async (email: string, password: string): Promise<{ user: User; role: UserRole }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? normalizeRole(userDoc.data()?.role) : UserRole.Patient;
        const resolvedRole = role ?? UserRole.Patient;

        // Get ID token and send to server to create an HttpOnly session cookie
        const idToken = await user.getIdToken(true);
        const sessionUrl = '/api/backend/api/auth/session';
        const res = await fetch(sessionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            redirect: 'manual',
            body: JSON.stringify({ idToken }),
        });
        if (!res.ok) {
            const body = await res.text();
            console.error('Session API error', res.status, body);
            throw new Error(body || 'Failed to establish session');
        }
        // Guard against misrouted redirects returning HTML (e.g. Next redirects /api/* to /blog).
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            const body = await res.text();
            console.error('Session API returned non-JSON response', res.status, contentType, body.slice(0, 200));
            throw new Error('Failed to establish session');
        }
        try {
            const payload = (await res.json()) as { ok?: boolean; role?: string; error?: string };
            if (!payload?.ok) {
                console.error('Session API returned unexpected payload', payload);
                throw new Error(payload?.error || 'Failed to establish session');
            }
        } catch (parseError) {
            console.error('Failed to parse Session API response', parseError);
            throw new Error('Failed to establish session');
        }

        // Refresh token to pull updated custom claims (role/admin) after session is established
        try {
            await user.getIdToken(true);
        } catch (refreshError) {
            console.warn('Failed to refresh token after session setup', refreshError);
        }

        return { user, role: resolvedRole };
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

export async function updateUserEmail(userId: string, nextEmail: string) {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) {
        throw new Error('User not authenticated');
    }
    if (currentUser.uid !== userId) {
        throw new Error('User mismatch');
    }
    const trimmed = nextEmail.trim();
    if (!trimmed) {
        throw new Error('Email is required');
    }
    if (currentUser.email === trimmed) {
        return;
    }
    await updateEmail(currentUser, trimmed);
}

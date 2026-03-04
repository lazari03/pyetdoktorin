import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, updateEmail, sendEmailVerification } from 'firebase/auth';
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

function getSiteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://pyetdoktorin.al');
}

async function establishServerSession(idToken: string): Promise<void> {
  const sessionUrl = '/api/backend/api/auth/session';
  const res = await fetch(sessionUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    redirect: 'manual',
    body: JSON.stringify({ idToken }),
  });
  if (!res.ok) {
    const contentType = res.headers.get('content-type') || '';
    const bodyText = await res.text();
    if (contentType.includes('application/json')) {
      try {
        const parsed = JSON.parse(bodyText) as { error?: string };
        throw new Error(parsed?.error || 'Failed to establish session');
      } catch {
        // fall through to plain text
      }
    }
    throw new Error(bodyText || 'Failed to establish session');
  }
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const body = await res.text();
    console.error('Session API returned non-JSON response', res.status, contentType, body.slice(0, 200));
    throw new Error('Failed to establish session');
  }
  const payload = (await res.json()) as { ok?: boolean; role?: string; error?: string };
  if (!payload?.ok) {
    throw new Error(payload?.error || 'Failed to establish session');
  }
}

export async function sendVerificationEmail(params?: { continueUrl?: string }): Promise<void> {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  const origin = getSiteOrigin();
  const continueUrl = params?.continueUrl ?? `${origin}/verify-email`;
  await sendEmailVerification(currentUser, { url: continueUrl, handleCodeInApp: true });
}

export async function establishSessionForCurrentUser(): Promise<void> {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  if (currentUser.email && currentUser.emailVerified !== true) {
    throw new Error('Email not verified');
  }
  const idToken = await currentUser.getIdToken(true);
  await establishServerSession(idToken);
}

export async function establishSessionForCurrentUserAllowUnverified(): Promise<void> {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  const idToken = await currentUser.getIdToken(true);
  await establishServerSession(idToken);
}

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
export const login = async (
  email: string,
  password: string
): Promise<{ user: User; role: UserRole; emailVerified: boolean }> => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Retrieve user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const role = userDoc.exists() ? normalizeRole(userDoc.data()?.role) : UserRole.Patient;
        const resolvedRole = role ?? UserRole.Patient;

        const emailVerified = user.emailVerified === true;

        // Establish server session for app navigation (API access is still blocked server-side until verified).
        const idToken = await user.getIdToken(true);
        await establishServerSession(idToken);

        // Refresh token to pull updated custom claims (role/admin) after session is established
        try {
            await user.getIdToken(true);
        } catch (refreshError) {
            console.warn('Failed to refresh token after session setup', refreshError);
        }

        return { user, role: resolvedRole, emailVerified };
    } catch (error) {
        console.error('Login error:', error); // Log the actual error object
        const message = error instanceof Error ? error.message : 'Failed to log in';
        throw new Error(message || 'Failed to log in');
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

import { getAuth, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { IAuthService, AuthState, CurrentUserInfo } from '@/application/ports/IAuthService';
import {
  isAuthenticated,
  fetchUserDetails,
  resetUserPassword,
  updateUserEmail,
  sendVerificationEmail,
  establishSessionForCurrentUser,
  establishSessionForCurrentUserAllowUnverified,
  reloadCurrentUser,
} from '@/infrastructure/services/authService';

export class AuthServiceAdapter implements IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): () => void {
    return isAuthenticated(callback);
  }

  observeIdToken(callback: (token: string | null) => void): () => void {
    const auth = getAuth();
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      const token = user ? await user.getIdToken() : null;
      callback(token);
    });
    return unsubscribe;
  }

  async fetchUserDetails(userId: string): Promise<{ name?: string } | null> {
    return fetchUserDetails(userId);
  }

  async resetUserPassword(email: string): Promise<void> {
    await resetUserPassword(email);
  }

  async updateUserEmail(userId: string, email: string): Promise<void> {
    await updateUserEmail(userId, email);
  }

  async sendVerificationEmail(params?: { continueUrl?: string }): Promise<void> {
    await sendVerificationEmail(params);
  }

  async establishSession(): Promise<void> {
    await establishSessionForCurrentUser();
  }

  async establishSessionAllowUnverified(): Promise<void> {
    await establishSessionForCurrentUserAllowUnverified();
  }

  async reloadUser(): Promise<boolean> {
    return reloadCurrentUser();
  }

  getCurrentUserId(): string | null {
    const auth = getAuth();
    return auth.currentUser?.uid ?? null;
  }

  async applyVerificationCode(oobCode: string): Promise<void> {
    const { applyActionCode } = await import('firebase/auth');
    const auth = getAuth();
    await applyActionCode(auth, oobCode);
  }

  isEmailVerified(): boolean {
    const auth = getAuth();
    return auth.currentUser?.emailVerified === true;
  }

  getLastSignInTime(): string | undefined {
    const auth = getAuth();
    return auth.currentUser?.metadata?.lastSignInTime ?? undefined;
  }

  getCurrentUserInfo(): CurrentUserInfo | null {
    const user = getAuth().currentUser;
    if (!user) return null;
    return {
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified === true,
    };
  }

  async reauthenticate(password: string): Promise<void> {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser?.email) throw new Error('User not authenticated');
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);
  }
}

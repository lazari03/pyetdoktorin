import { getAuth, EmailAuthProvider, reauthenticateWithCredential, applyActionCode } from 'firebase/auth';
import { IAuthService, AuthState } from '@/application/ports/IAuthService';
import {
  isAuthenticated,
  fetchUserDetails,
  resetUserPassword,
  updateUserEmail,
  sendVerificationEmail as sendVerificationEmailService,
  establishSessionForCurrentUser,
  establishSessionForCurrentUserAllowUnverified,
} from '@/infrastructure/services/authService';

export class AuthServiceAdapter implements IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): void {
    isAuthenticated(callback);
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

  async getIdToken(): Promise<string> {
    const currentUser = getAuth().currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    return currentUser.getIdToken();
  }

  async reauthenticate(password: string): Promise<void> {
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (!currentUser) throw new Error('No authenticated user');
    const email = currentUser.email;
    if (!email) throw new Error('Missing email for re-authentication');
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(currentUser, credential);
    await currentUser.getIdToken(true);
  }

  async sendVerificationEmail(continueUrl?: string): Promise<void> {
    await sendVerificationEmailService({ continueUrl });
  }

  async establishSession(): Promise<void> {
    await establishSessionForCurrentUser();
  }

  async reloadUser(): Promise<boolean> {
    const currentUser = getAuth().currentUser;
    if (!currentUser) return false;
    await currentUser.reload();
    return currentUser.emailVerified === true;
  }

  async applyVerificationCode(oobCode: string): Promise<void> {
    await applyActionCode(getAuth(), oobCode);
  }

  async establishSessionAllowUnverified(): Promise<void> {
    await establishSessionForCurrentUserAllowUnverified();
  }
}

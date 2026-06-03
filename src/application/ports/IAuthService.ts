export type AuthState = { userId: string | null; error: string | null };

export interface IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): void;
  fetchUserDetails(userId: string): Promise<{ name?: string } | null>;
  resetUserPassword(email: string): Promise<void>;
  updateUserEmail(userId: string, email: string): Promise<void>;
  getIdToken(): Promise<string>;
  reauthenticate(password: string): Promise<void>;
  sendVerificationEmail(continueUrl?: string): Promise<void>;
  establishSession(): Promise<void>;
  reloadUser(): Promise<boolean>;
  applyVerificationCode(oobCode: string): Promise<void>;
  establishSessionAllowUnverified(): Promise<void>;
}

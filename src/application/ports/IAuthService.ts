export type AuthState = { userId: string | null; error: string | null };
export type CurrentUserInfo = {
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
};

export interface IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): () => void;
  observeIdToken(callback: (token: string | null) => void): () => void;
  fetchUserDetails(userId: string): Promise<{ name?: string } | null>;
  resetUserPassword(email: string): Promise<void>;
  updateUserEmail(userId: string, email: string): Promise<void>;
  sendVerificationEmail(params?: { continueUrl?: string }): Promise<void>;
  establishSession(): Promise<void>;
  establishSessionAllowUnverified(): Promise<void>;
  reloadUser(): Promise<boolean>;
  getCurrentUserId(): string | null;
  applyVerificationCode(oobCode: string): Promise<void>;
  isEmailVerified(): boolean;
  getLastSignInTime(): string | undefined;
  getCurrentUserInfo(): CurrentUserInfo | null;
  reauthenticate(password: string): Promise<void>;
}

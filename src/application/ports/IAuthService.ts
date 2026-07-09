export type AuthState = { userId: string | null; error: string | null };
export type CurrentUserInfo = {
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
};

export type FullAuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
};

export type CurrentUserProfile = {
  id: string;
  uid: string;
  role: string;
  name?: string;
  surname?: string;
  email?: string;
  emailVerified?: boolean;
  phoneNumber?: string;
};

export interface IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): () => void;
  observeIdToken(callback: (token: string | null) => void): () => void;
  fetchUserDetails(userId: string): Promise<{ name?: string } | null>;
  resetUserPassword(email: string): Promise<void>;
  updateUserEmail(userId: string, email: string): Promise<void>;
  getIdToken(): Promise<string>;
  reauthenticate(password: string): Promise<void>;
  sendVerificationEmail(continueUrl?: string): Promise<void>;
  establishSession(): Promise<void>;
  reloadUser(): Promise<boolean>;
  applyVerificationCode(oobCode: string): Promise<void>;
  getLastSignInTime(): string | null;
  establishSessionAllowUnverified(): Promise<void>;
  observeFullAuthState(callback: (user: FullAuthUser | null) => Promise<void> | void): () => void;
  fetchCurrentUser(): Promise<CurrentUserProfile>;
}

export type AuthState = { userId: string | null; error: string | null };

export interface IAuthService {
  observeAuthState(callback: (authState: AuthState) => void): void;
  fetchUserDetails(userId: string): Promise<{ name?: string } | null>;
  resetUserPassword(email: string): Promise<void>;
}

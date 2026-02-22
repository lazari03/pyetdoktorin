import { IAuthService, AuthState } from '@/application/ports/IAuthService';
import { isAuthenticated, fetchUserDetails, resetUserPassword, updateUserEmail } from '@/infrastructure/services/authService';

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
}

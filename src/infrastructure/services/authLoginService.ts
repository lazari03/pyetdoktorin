import { IAuthLoginService } from '@/application/ports/IAuthLoginService';
import { login } from '@/infrastructure/services/authService';

export class AuthLoginService implements IAuthLoginService {
  async login(email: string, password: string) {
    const result = await login(email, password);
    return { role: result.role, emailVerified: result.emailVerified };
  }

  async testConnection(): Promise<void> {
    // No-op: method required by interface but not used
    return Promise.resolve();
  }
}

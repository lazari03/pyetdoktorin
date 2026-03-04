import { IAuthLoginService } from '@/application/ports/IAuthLoginService';
import { login } from '@/infrastructure/services/authService';
import { testFirebaseConnection } from '@/infrastructure/firebaseTest';

export class AuthLoginService implements IAuthLoginService {
  async login(email: string, password: string) {
    const result = await login(email, password);
    return { role: result.role, emailVerified: result.emailVerified };
  }

  async testConnection(): Promise<void> {
    await testFirebaseConnection();
  }
}

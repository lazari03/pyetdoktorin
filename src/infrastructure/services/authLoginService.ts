import { IAuthLoginService } from '@/application/ports/IAuthLoginService';
import { login } from '@/infrastructure/services/authService';
import { testFirebaseConnection } from '@/infrastructure/firebaseTest';

export class AuthLoginService implements IAuthLoginService {
  async login(email: string, password: string) {
    return login(email, password);
  }

  async testConnection(): Promise<void> {
    await testFirebaseConnection();
  }
}

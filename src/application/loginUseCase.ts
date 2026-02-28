import { IAuthLoginService } from '@/application/ports/IAuthLoginService';
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';
import type { UserRole } from '@/domain/entities/UserRole';

export class LoginUseCase {
  constructor(
    private authLoginService: IAuthLoginService,
    private analytics?: IAnalyticsService
  ) {}

  async execute(email: string, password: string): Promise<{ role: UserRole }> {
    const result = await this.authLoginService.login(email, password);
    this.analytics?.track('user_logged_in', { email: email.split('@')[0] + '@***' });
    return { role: result.role };
  }
}

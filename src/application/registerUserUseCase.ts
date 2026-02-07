import { IRegistrationService, RegistrationData } from '@/application/ports/IRegistrationService';
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';

export class RegisterUserUseCase {
  constructor(
    private registrationService: IRegistrationService,
    private analytics?: IAnalyticsService
  ) {}

  async execute(data: RegistrationData): Promise<void> {
    await this.registrationService.register(data);
    this.analytics?.track('user_registered', { 
      role: data.role,
      email: data.email.split('@')[0] + '@***'
    });
  }
}

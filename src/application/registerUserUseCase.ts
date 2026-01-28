import { IRegistrationService, RegistrationData } from '@/application/ports/IRegistrationService';

export class RegisterUserUseCase {
  constructor(private registrationService: IRegistrationService) {}

  async execute(data: RegistrationData): Promise<void> {
    await this.registrationService.register(data);
  }
}

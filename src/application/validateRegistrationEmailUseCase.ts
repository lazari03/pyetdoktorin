import type { EmailValidationResult, IEmailValidationService } from '@/application/ports/IEmailValidationService';

export class ValidateRegistrationEmailUseCase {
  constructor(private emailValidationService: IEmailValidationService) {}

  async execute(email: string): Promise<EmailValidationResult> {
    return this.emailValidationService.validate(email);
  }
}

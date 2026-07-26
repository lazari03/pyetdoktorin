import type { EmailValidationResult, IEmailValidationService } from '@/application/ports/IEmailValidationService';
import { backendFetch } from '@/network/backendClient';

export class EmailValidationService implements IEmailValidationService {
  async validate(email: string): Promise<EmailValidationResult> {
    return backendFetch<EmailValidationResult>('/api/auth/validate-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }
}

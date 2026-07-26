export type EmailValidationReason = 'invalid_format' | 'disposable' | 'no_mx';

export interface EmailValidationResult {
  valid: boolean;
  reason?: EmailValidationReason;
}

export interface IEmailValidationService {
  validate(email: string): Promise<EmailValidationResult>;
}

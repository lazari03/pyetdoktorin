export interface RegistrationData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor';
}

export interface IRegistrationService {
  register(data: RegistrationData): Promise<void>;
}

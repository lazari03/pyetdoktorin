export interface RegistrationData {
  name: string;
  surname: string;
  phone: string;
  email: string;
  password: string;
  role: string;
}

export interface IRegistrationService {
  register(data: RegistrationData): Promise<void>;
}

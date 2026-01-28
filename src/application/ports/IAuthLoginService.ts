export interface IAuthLoginService {
  login(email: string, password: string): Promise<void>;
  testConnection(): Promise<void>;
}

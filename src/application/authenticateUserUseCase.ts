import { IUserRepository } from '../domain/repositories/IUserRepository';
import { User } from '../domain/entities/User';

export class AuthenticateUserUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(email: string, password: string): Promise<User | null> {
    const result = await this.userRepo.authenticate(email, password);
    if (!result) return null;
    // Convert repository result to User entity if needed
    return {
      id: result.id,
      email,
      role: result.role
    };
  }
}

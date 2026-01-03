import { UserRole } from '../domain/entities/UserRole';
import { IUserRepository } from '../domain/repositories/IUserRepository';

export class CheckProfileCompleteUseCase {
  constructor(private userRepo: IUserRepository) {}

  async execute(role: UserRole, userId: string): Promise<boolean> {
    return await this.userRepo.isProfileIncomplete(role, userId);
  }
}

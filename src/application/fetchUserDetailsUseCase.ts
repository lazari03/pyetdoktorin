import { IAuthService } from '@/application/ports/IAuthService';

export class FetchUserDetailsUseCase {
  constructor(private authService: IAuthService) {}

  async execute(userId: string): Promise<{ name?: string } | null> {
    return this.authService.fetchUserDetails(userId);
  }
}

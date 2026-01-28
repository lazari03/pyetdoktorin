import { AuthState, IAuthService } from '@/application/ports/IAuthService';

export class ObserveAuthStateUseCase {
  constructor(private authService: IAuthService) {}

  execute(callback: (authState: AuthState) => void): void {
    this.authService.observeAuthState(callback);
  }
}

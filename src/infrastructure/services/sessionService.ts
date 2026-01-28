import { ISessionService } from '@/application/ports/ISessionService';
import { logoutApi } from '@/network/logoutApi';

export class SessionService implements ISessionService {
  async logoutServer(): Promise<void> {
    await logoutApi();
  }
}

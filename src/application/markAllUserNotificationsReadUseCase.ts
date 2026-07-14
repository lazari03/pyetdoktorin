import type { IUserNotificationsService } from '@/application/ports/IUserNotificationsService';

export class MarkAllUserNotificationsReadUseCase {
  constructor(private userNotificationsService: IUserNotificationsService) {}

  async execute(): Promise<{ updated: number }> {
    return this.userNotificationsService.markAllRead();
  }
}

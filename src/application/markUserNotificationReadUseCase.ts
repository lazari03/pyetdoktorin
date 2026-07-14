import type { IUserNotificationsService } from '@/application/ports/IUserNotificationsService';

export class MarkUserNotificationReadUseCase {
  constructor(private userNotificationsService: IUserNotificationsService) {}

  async execute(id: string): Promise<void> {
    return this.userNotificationsService.markRead(id);
  }
}

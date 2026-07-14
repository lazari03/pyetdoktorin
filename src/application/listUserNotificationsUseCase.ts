import type { IUserNotificationsService, UserNotificationDTO } from '@/application/ports/IUserNotificationsService';

export class ListUserNotificationsUseCase {
  constructor(private userNotificationsService: IUserNotificationsService) {}

  async execute(): Promise<{ items: UserNotificationDTO[]; unreadCount: number }> {
    return this.userNotificationsService.list();
  }
}

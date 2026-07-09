import type { INotificationService } from './ports/INotificationService';

export class DismissNotificationUseCase {
  constructor(private notificationService: INotificationService) {}
  async execute(appointmentId: string, userId: string): Promise<void> {
    return this.notificationService.dismissNotification(appointmentId, userId);
  }
}

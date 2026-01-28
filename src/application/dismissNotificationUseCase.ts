import { INotificationService } from '@/application/ports/INotificationService';

export class DismissNotificationUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(appointmentId: string, userId: string): Promise<void> {
    await this.notificationService.dismissNotification(appointmentId, userId);
  }
}

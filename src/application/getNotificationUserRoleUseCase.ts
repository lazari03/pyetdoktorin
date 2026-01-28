import { INotificationService } from '@/application/ports/INotificationService';

export class GetNotificationUserRoleUseCase {
  constructor(private notificationService: INotificationService) {}

  async execute(userId: string): Promise<string | null> {
    return this.notificationService.getUserRole(userId);
  }
}

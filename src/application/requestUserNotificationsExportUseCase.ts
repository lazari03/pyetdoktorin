import type { IUserNotificationsService } from '@/application/ports/IUserNotificationsService';

export class RequestUserNotificationsExportUseCase {
  constructor(private userNotificationsService: IUserNotificationsService) {}

  async execute(): Promise<void> {
    return this.userNotificationsService.requestExport();
  }
}

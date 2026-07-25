import type {
  BroadcastNotificationInput,
  IAdminNotificationsService,
} from '@/application/ports/IAdminNotificationsService';

export class BroadcastNotificationUseCase {
  constructor(private adminNotificationsService: IAdminNotificationsService) {}

  async execute(input: BroadcastNotificationInput): Promise<{ ok: boolean; count: number }> {
    return this.adminNotificationsService.broadcast(input);
  }
}

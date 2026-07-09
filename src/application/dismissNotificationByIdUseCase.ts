import type { INotificationService } from './ports/INotificationService';

export class DismissNotificationByIdUseCase {
  constructor(private service: INotificationService) {}
  async execute(id: string): Promise<void> {
    return this.service.dismissNotificationById(id);
  }
}

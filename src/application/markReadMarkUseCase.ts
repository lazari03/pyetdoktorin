import type { IReadMarksService } from '@/application/ports/IReadMarksService';

export class MarkReadMarkUseCase {
  constructor(private readMarksService: IReadMarksService) {}

  async execute(id: string): Promise<void> {
    return this.readMarksService.markRead(id);
  }
}

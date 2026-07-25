import type { IReadMarksService } from '@/application/ports/IReadMarksService';

export class MarkManyReadMarksUseCase {
  constructor(private readMarksService: IReadMarksService) {}

  async execute(ids: string[]): Promise<void> {
    return this.readMarksService.markManyRead(ids);
  }
}

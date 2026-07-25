import type { IReadMarksService } from '@/application/ports/IReadMarksService';

export class ListReadMarksUseCase {
  constructor(private readMarksService: IReadMarksService) {}

  async execute(): Promise<string[]> {
    return this.readMarksService.list();
  }
}

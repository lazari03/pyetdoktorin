export interface IReadMarksService {
  list(): Promise<string[]>;
  markRead(id: string): Promise<void>;
  markManyRead(ids: string[]): Promise<void>;
}

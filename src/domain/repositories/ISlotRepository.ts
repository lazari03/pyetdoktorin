import { SlotStatus } from '../entities/SlotStatus';

export interface ISlotRepository {
  getByDoctor(doctorId: string): Promise<Array<{ date: string; time: string; status: SlotStatus }>>;
  updateStatus(doctorId: string, date: string, time: string, status: SlotStatus): Promise<void>;
}

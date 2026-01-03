import { ISlotRepository } from '../domain/repositories/ISlotRepository';
import { SlotStatus } from '../domain/entities/SlotStatus';
import { isSlotAvailable, isSlotBooked } from '../domain/rules/slotRules';

export class UpdateSlotStatusUseCase {
  constructor(private slotRepo: ISlotRepository) {}

  async execute(doctorId: string, date: string, time: string, status: SlotStatus): Promise<void> {
    if (!isSlotAvailable(status) && !isSlotBooked(status)) {
      throw new Error('Invalid slot status');
    }
    await this.slotRepo.updateStatus(doctorId, date, time, status);
  }
}

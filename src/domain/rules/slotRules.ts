import { SlotStatus } from '../entities/SlotStatus';

export function isSlotAvailable(status: SlotStatus): boolean {
  return status === SlotStatus.Available;
}

export function isSlotBooked(status: SlotStatus): boolean {
  return status === SlotStatus.Booked;
}

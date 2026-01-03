import { SlotStatus } from "@/domain/entities/SlotStatus";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { isSlotAvailable, isSlotBooked } from './rules/slotRules';

export async function updateSlotStatus(
  doctorId: string,
  date: string,
  time: string,
  status: SlotStatus
): Promise<void> {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);
  if (isSlotAvailable(status) || isSlotBooked(status) || status === SlotStatus.Pending) {
    await updateDoc(docRef, {
      [`availability.${slotKey}`]: status,
    });
  } else {
    throw new Error(`Invalid slot status: ${status}`);
  }
}

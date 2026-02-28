import { Appointment } from "@/domain/entities/Appointment";
import { PAYMENT_PROCESSING_TIMEOUT_MS } from "@/config/paywallConfig";

export function isPaymentProcessingActive(appointment: Appointment, now = Date.now()): boolean {
  if (!appointment || appointment.isPaid || appointment.paymentStatus !== "processing") {
    return false;
  }
  const startedAt = appointment.paymentStartedAt;
  if (!startedAt) {
    return false;
  }
  return now - startedAt < PAYMENT_PROCESSING_TIMEOUT_MS;
}

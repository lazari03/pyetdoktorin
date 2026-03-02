import { isValidAppointment, isAppointmentPaid } from '@/domain/rules/appointmentRules';
import { appointmentRepository } from '@/infrastructure/appointmentRepository';
import { userRepository } from '@/infrastructure/userRepository';
import { USER_ROLE_PATIENT } from "@/config/userRoles";


// Mark appointment as paid
export async function setAppointmentPaid(appointmentId: string): Promise<void> {
  const updated = await appointmentRepository.markAsPaid(appointmentId);
  if (!isAppointmentPaid(updated)) {
    throw new Error('Appointment payment status not updated correctly.');
  }
}


export async function getAppointments(userId: string, isDoctor: boolean) {
  if (!userId) throw new Error("User ID is missing");
  const appointments = await appointmentRepository.getByUser(userId, isDoctor);
  return appointments.filter(isValidAppointment);
}

// Check if appointment is past by id

export async function checkIfPastAppointment(appointmentId: string) {
  const appointment = await appointmentRepository.getById(appointmentId);
  if (!appointment) return false;
  const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
  const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
  return appointmentEndTime < new Date();
}

export async function getUserRole(userId: string) {
  try {
    const user = await userRepository.getById(userId);
    return user?.role ?? USER_ROLE_PATIENT;
  } catch {
    return USER_ROLE_PATIENT;
  }
}

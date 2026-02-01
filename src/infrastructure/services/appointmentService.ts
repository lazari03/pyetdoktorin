// Fetch appointments for a user (doctor or patient)
// import { Appointment } from "@/domain/entities/Appointment";
import { isValidAppointment, isAppointmentPaid } from '@/domain/rules/appointmentRules';
import { getDefaultPatientName, getDefaultStatus } from "@/utils/userUtils";
import { appointmentRepository } from '@/infrastructure/appointmentRepository';
import { getAuth } from "firebase/auth";
import { getUserPhoneNumber } from "@/infrastructure/services/userService";
import { sendDoctorAppointmentRequestSMS } from "@/infrastructure/services/smsService";

import { userRepository } from '@/infrastructure/userRepository';
import type { AppointmentPayload } from "@/models/AppointmentPayload";
import type { BookAppointmentPayload } from "@/models/BookAppointmentPayload";
import { updateSlotStatus } from "@/infrastructure/services/slotService";
import { SlotStatus } from "@/domain/entities/SlotStatus";
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

async function createAndNotifyAppointment(payload: AppointmentPayload): Promise<{ id: string } & AppointmentPayload> {
  // Map status string to AppointmentStatus enum value
  const { status, ...rest } = payload;
  const { AppointmentStatus } = await import('@/domain/entities/AppointmentStatus');
  type AppointmentStatusType = (typeof AppointmentStatus)[keyof typeof AppointmentStatus];
  const statusEnum: AppointmentStatusType = Object.values(AppointmentStatus).includes(status as AppointmentStatusType)
    ? (status as AppointmentStatusType)
    : AppointmentStatus.Pending;
  const appointment = {
    ...rest,
    status: statusEnum,
    createdAt: new Date().toISOString(),
  };
  try {
    const created = await appointmentRepository.create(appointment);
    const doctorPhone = await getUserPhoneNumber(payload.doctorId);
    if (doctorPhone) await sendDoctorAppointmentRequestSMS(doctorPhone, payload.patientName);
    // Return as AppointmentPayload (status as string)
    return { id: created.id, ...payload };
  } catch (error) {
    console.error('Appointment booking error:', error, appointment);
    throw new Error('Failed to book appointment.');
  }
}

export async function bookAppointment(appointmentData: BookAppointmentPayload): Promise<{ id: string } & AppointmentPayload> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated. Please log in.");
  const payload: AppointmentPayload = {
    ...appointmentData,
    status: getDefaultStatus(appointmentData.status),
    patientId: user.uid,
  patientName: getDefaultPatientName(user.displayName ?? undefined),
  };
  return createAndNotifyAppointment(payload);
}

export async function markSlotAsPending(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Pending);
}

export async function markSlotAsBooked(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Booked);
}

export async function markSlotAsAvailable(doctorId: string, date: string, time: string): Promise<void> {
  await updateSlotStatus(doctorId, date, time, SlotStatus.Available);
}

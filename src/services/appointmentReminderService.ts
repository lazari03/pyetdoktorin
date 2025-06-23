import { getUserPhoneNumber } from './userService';
import { sendPatientAppointmentReminderSMS } from './smsService';
import { Appointment } from '../models/Appointment';

/**
 * Schedules a reminder SMS to be sent 5 minutes before the appointment.
 * In production, this should be handled by a backend cron job or cloud function.
 * This is a stub for demonstration/testing purposes only.
 */
export async function sendAppointmentReminder(appointment: Appointment) {
  if (!appointment.patientId || !appointment.doctorName || !appointment.preferredDate || !appointment.preferredTime) return;
  const patientPhone = await getUserPhoneNumber(appointment.patientId);
  console.log('Patient phone number:', patientPhone); // Print the phone number
  if (!patientPhone) return;
  // Compose the time string for the reminder
  const time = `${appointment.preferredDate} ${appointment.preferredTime}`;
  await sendPatientAppointmentReminderSMS(patientPhone, appointment.doctorName, time);
}

// Example usage (to be called by a scheduler):
// await sendAppointmentReminder(appointment);

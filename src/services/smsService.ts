import axios from 'axios';
import qs from 'qs';
import { getUserPhoneNumber } from './userService';

const VONAGE_API_KEY = process.env.NEXT_PUBLIC_VONAGE_API_KEY || '9742b306';
const VONAGE_API_SECRET = process.env.NEXT_PUBLIC_VONAGE_API_SECRET || 'SCKmmzn7gyzBccaI';
const VONAGE_SMS_URL = 'https://rest.nexmo.com/sms/json';
const FROM = 'Portokalle';

export async function sendSMSFromFirestore(userId: string, text: string): Promise<void> {
  try {
    const to = await getUserPhoneNumber(userId);
    if (!to) throw new Error('Phone number not found for user: ' + userId);
    const data = {
      api_key: VONAGE_API_KEY,
      api_secret: VONAGE_API_SECRET,
      from: FROM,
      to,
      text,
    };
    await axios.post(VONAGE_SMS_URL, qs.stringify(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (typeof window === 'undefined') {
    }
  } catch (error) {
    throw error;
  }
}

export async function sendDoctorAppointmentRequestSMS(doctorId: string, patientName: string) {
  const text = `You have a new appointment request from ${patientName} on portokalle.al. Please log in to review.`;
  await sendSMSFromFirestore(doctorId, text);
}

export async function sendPatientAppointmentAcceptedSMS(patientId: string, doctorName: string) {
  const text = `Your appointment with Dr. ${doctorName} has been accepted. Please log in to portokalle.al to pay and confirm.`;
  await sendSMSFromFirestore(patientId, text);
}

export async function sendPatientAppointmentReminderSMS(patientId: string, doctorName: string, time: string) {
  const text = `Reminder: You have an appointment with Dr. ${doctorName} on portokalle.al in 5 min at ${time}.`;
  await sendSMSFromFirestore(patientId, text);
}

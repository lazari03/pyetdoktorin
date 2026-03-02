import axios from 'axios';
import qs from 'qs';
import { getAdmin } from '@/app/api/_lib/admin';

const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const VONAGE_SMS_URL = 'https://rest.nexmo.com/sms/json';
const FROM = process.env.VONAGE_FROM || 'PyetDoktorin';

async function getUserPhoneNumberServer(userId: string): Promise<string | null> {
  const { db } = getAdmin();
  const snap = await db.collection('users').doc(userId).get();
  if (!snap.exists) return null;
  const data = snap.data() as { phoneNumber?: unknown } | undefined;
  return typeof data?.phoneNumber === 'string' && data.phoneNumber.trim() ? data.phoneNumber : null;
}

export async function sendSmsToUserId(userId: string, text: string): Promise<void> {
  if (!VONAGE_API_KEY || !VONAGE_API_SECRET) {
    throw new Error('VONAGE_NOT_CONFIGURED');
  }
  const to = await getUserPhoneNumberServer(userId);
  if (!to) throw new Error('PHONE_NOT_FOUND');

  const payload = {
    api_key: VONAGE_API_KEY,
    api_secret: VONAGE_API_SECRET,
    from: FROM,
    to,
    text,
  };

  await axios.post(VONAGE_SMS_URL, qs.stringify(payload), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 10_000,
  });
}

export async function sendDoctorAppointmentRequestSms(doctorId: string, patientName: string) {
  const text = `You have a new appointment request from ${patientName} on PyetDoktorin.al. Please log in to review.`;
  await sendSmsToUserId(doctorId, text);
}

export async function sendPatientAppointmentAcceptedSms(patientId: string, doctorName: string) {
  const text = `Your appointment with Dr. ${doctorName} has been accepted. Please check your dashboard for details.`;
  await sendSmsToUserId(patientId, text);
}

export async function sendPatientAppointmentReminderSms(patientId: string, doctorName: string, time: string) {
  const text = `Reminder: Your appointment with Dr. ${doctorName} is scheduled for ${time}.`;
  await sendSmsToUserId(patientId, text);
}


import axios from 'axios';
import qs from 'qs';

const VONAGE_API_KEY = process.env.NEXT_PUBLIC_VONAGE_API_KEY || '9742b306';
const VONAGE_API_SECRET = process.env.NEXT_PUBLIC_VONAGE_API_SECRET || 'SCKmmzn7gyzBccaI';
const VONAGE_SMS_URL = 'https://rest.nexmo.com/sms/json';
const FROM = 'Portokalle';
const DEMO_NUMBER = '+355699116981';

export async function sendSMS(to: string, text: string): Promise<void> {
  try {
    await axios.post(VONAGE_SMS_URL, {
      api_key: VONAGE_API_KEY,
      api_secret: VONAGE_API_SECRET,
      to,
      from: FROM,
      text,
    });
    if (typeof window === 'undefined') {
      // Node.js/server environment: print to terminal
      // eslint-disable-next-line no-console
      console.log(`SMS sent to ${to}: ${text}`);
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    throw error;
  }
}

// Usage: sendDoctorAppointmentRequestSMS(doctorPhone, patientName)
export async function sendDoctorAppointmentRequestSMS(doctorPhone: string, patientName: string) {
  const text = `You have a new appointment request from ${patientName} on portokalle.al. Please log in to review.`;
  await sendSMS(doctorPhone, text);
}

// Usage: sendPatientAppointmentAcceptedSMS(patientPhone, doctorName)
export async function sendPatientAppointmentAcceptedSMS(patientPhone: string, doctorName: string) {
  const text = `Your appointment with Dr. ${doctorName} has been accepted. Please log in to portokalle.al to pay and confirm.`;
  await sendSMS(patientPhone, text);
}

// Usage: sendPatientAppointmentReminderSMS(patientPhone, doctorName, time)
export async function sendPatientAppointmentReminderSMS(patientPhone: string, doctorName: string, time: string) {
  const text = `Reminder: You have an appointment with Dr. ${doctorName} on portokalle.al in 5 min at ${time}.`;
  await sendSMS(patientPhone, text);
}

export async function sendDemoSMS(text: string): Promise<void> {
  try {
    const data = {
      api_key: VONAGE_API_KEY,
      api_secret: VONAGE_API_SECRET,
      from: FROM,
      to: DEMO_NUMBER,
      text,
    };
    await axios.post(VONAGE_SMS_URL, qs.stringify(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    if (typeof window === 'undefined') {
      console.log(`Demo SMS sent to ${DEMO_NUMBER}: ${text}`);
    }
  } catch (error) {
    console.error('Failed to send demo SMS:', error);
    throw error;
  }
}

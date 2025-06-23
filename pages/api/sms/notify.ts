import type { NextApiRequest, NextApiResponse } from 'next';
import { sendDoctorAppointmentRequestSMS, sendPatientAppointmentAcceptedSMS, sendPatientAppointmentReminderSMS } from '@/services/smsService';

// POST /api/sms/notify-doctor
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, doctorId, patientId, doctorName, patientName, time } = req.body;

  try {
    console.log('Incoming request body:', req.body);
    if (type === 'appointment-request') {
      if (!doctorId) throw new Error('Doctor ID not provided');
      await sendDoctorAppointmentRequestSMS(doctorId, patientName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-accepted') {
      if (!patientId) throw new Error('Patient ID not provided');
      await sendPatientAppointmentAcceptedSMS(patientId, doctorName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-reminder') {
      if (!patientId) throw new Error('Patient ID not provided');
      await sendPatientAppointmentReminderSMS(patientId, doctorName, time);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    console.error('Error in /api/sms/notify:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

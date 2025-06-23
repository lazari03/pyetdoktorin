import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/config/firebaseconfig';
import { getDoc, doc } from 'firebase/firestore';
import { sendDoctorAppointmentRequestSMS, sendPatientAppointmentAcceptedSMS, sendPatientAppointmentReminderSMS } from '@/services/smsService';

// POST /api/sms/notify-doctor
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type, doctorId, patientId, appointmentId, doctorName, patientName, patientPhone, doctorPhone, time } = req.body;

  try {
    console.log('Incoming request body:', req.body);
    if (type === 'appointment-request') {
      // Fetch doctor phone from Firestore if not provided
      let phone = doctorPhone;
      if (!phone && doctorId) {
        const doctorDoc = await getDoc(doc(db, 'users', doctorId));
        console.log('Doctor doc:', doctorDoc.exists() ? doctorDoc.data() : null);
        phone = doctorDoc.exists() ? doctorDoc.data().phoneNumber : null;
      }
      if (!phone) throw new Error('Doctor phone not found');
      await sendDoctorAppointmentRequestSMS(phone, patientName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-accepted') {
      // Fetch patient phone from Firestore if not provided
      let phone = patientPhone;
      if (!phone && patientId) {
        const patientDoc = await getDoc(doc(db, 'users', patientId));
        console.log('Patient doc:', patientDoc.exists() ? patientDoc.data() : null);
        phone = patientDoc.exists() ? patientDoc.data().phoneNumber : null;
      }
      if (!phone) throw new Error('Patient phone not found');
      await sendPatientAppointmentAcceptedSMS(phone, doctorName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-reminder') {
      // Fetch patient phone from Firestore if not provided
      let phone = patientPhone;
      if (!phone && patientId) {
        const patientDoc = await getDoc(doc(db, 'users', patientId));
        console.log('Patient doc:', patientDoc.exists() ? patientDoc.data() : null);
        phone = patientDoc.exists() ? patientDoc.data().phoneNumber : null;
      }
      if (!phone) throw new Error('Patient phone not found');
      await sendPatientAppointmentReminderSMS(phone, doctorName, time);
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    console.error('Error in /api/sms/notify:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

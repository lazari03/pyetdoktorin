import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getAdmin } from '@/app/api/_lib/admin';

type SessionPayload = {
  userId: string;
  appointmentId: string;
  role: string;
  roomCode: string;
  roomUUID?: string;
  exp: number;
};
type AppointmentDoc = {
  doctorId?: string;
  patientId?: string;
  status?: string;
  isPaid?: boolean;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: 'SESSION_SECRET is not configured' });
  }

  const { sessionToken } = req.body ?? {};
  if (!sessionToken) {
    return res.status(400).json({ error: 'Missing sessionToken' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token missing' });
  }

  const idToken = authHeader.substring(7);
  const { auth: adminAuth, db: adminDb } = getAdmin();

  let decodedIdToken;
  try {
    decodedIdToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Failed to verify Firebase ID token', error);
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }

  let sessionPayload: SessionPayload;
  try {
    sessionPayload = jwt.verify(sessionToken, sessionSecret) as SessionPayload;
  } catch (error) {
    console.error('Session token verification failed', error);
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }

  if (sessionPayload.userId !== decodedIdToken.uid) {
    return res.status(403).json({ error: 'Session does not belong to this user' });
  }

  const appointmentSnap = await adminDb.collection('appointments').doc(sessionPayload.appointmentId).get();
  if (!appointmentSnap.exists) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  const appointmentData = appointmentSnap.data() as AppointmentDoc;
  const appointmentStatus = (appointmentData?.status || '').toString().toLowerCase();
  const isDoctor = appointmentData?.doctorId === sessionPayload.userId;
  const isPatient = appointmentData?.patientId === sessionPayload.userId;

  if (!isDoctor && !isPatient) {
    return res.status(403).json({ error: 'You are not assigned to this appointment' });
  }

  if (appointmentStatus === 'cancelled') {
    return res.status(403).json({ error: 'Appointment is cancelled' });
  }

  if (isPatient && !appointmentData?.isPaid && appointmentStatus !== 'completed') {
    return res.status(402).json({ error: 'Payment required before joining' });
  }

  return res.status(200).json({
    roomCode: sessionPayload.roomCode,
    appointmentId: sessionPayload.appointmentId,
    role: sessionPayload.role,
  });
}

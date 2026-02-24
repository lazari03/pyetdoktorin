import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { getAdmin } from '@/app/api/_lib/admin';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';

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
    return res.status(405).json({ error: VIDEO_ERROR_CODES.MethodNotAllowed });
  }

  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: VIDEO_ERROR_CODES.SessionSecretMissing });
  }

  const { sessionToken } = req.body ?? {};
  if (!sessionToken) {
    return res.status(400).json({ error: VIDEO_ERROR_CODES.MissingParams });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: VIDEO_ERROR_CODES.AuthMissing });
  }

  const idToken = authHeader.substring(7);
  const { auth: adminAuth, db: adminDb } = getAdmin();

  let decodedIdToken;
  try {
    decodedIdToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Failed to verify Firebase ID token', error);
    return res.status(401).json({ error: VIDEO_ERROR_CODES.AuthInvalid });
  }

  let sessionPayload: SessionPayload;
  try {
    sessionPayload = jwt.verify(sessionToken, sessionSecret) as SessionPayload;
  } catch (error) {
    console.error('Session token verification failed', error);
    return res.status(401).json({ error: VIDEO_ERROR_CODES.AuthInvalid });
  }

  if (sessionPayload.userId !== decodedIdToken.uid) {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.UserMismatch });
  }

  const appointmentSnap = await adminDb.collection('appointments').doc(sessionPayload.appointmentId).get();
  if (!appointmentSnap.exists) {
    return res.status(404).json({ error: VIDEO_ERROR_CODES.AppointmentNotFound });
  }

  const appointmentData = appointmentSnap.data() as AppointmentDoc;
  const appointmentStatus = (appointmentData?.status || '').toString().toLowerCase();
  const isDoctor = appointmentData?.doctorId === sessionPayload.userId;
  const isPatient = appointmentData?.patientId === sessionPayload.userId;

  if (!isDoctor && !isPatient) {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentForbidden });
  }

  if (appointmentStatus === 'cancelled') {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentCancelled });
  }

  if (isPatient && !appointmentData?.isPaid && appointmentStatus !== 'completed') {
    return res.status(402).json({ error: VIDEO_ERROR_CODES.PaymentRequired });
  }

  return res.status(200).json({
    roomCode: sessionPayload.roomCode,
    appointmentId: sessionPayload.appointmentId,
    role: sessionPayload.role,
  });
}

import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getAdmin } from '@/app/api/_lib/admin';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

type RequestBody = {
  sessionToken?: unknown;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

export async function POST(req: Request) {
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return jsonError(VIDEO_ERROR_CODES.SessionSecretMissing, 500);
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonError(VIDEO_ERROR_CODES.MissingParams, 400);
  }

  if (typeof body.sessionToken !== 'string' || body.sessionToken.trim().length === 0) {
    return jsonError(VIDEO_ERROR_CODES.MissingParams, 400);
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonError(VIDEO_ERROR_CODES.AuthMissing, 401);
  }

  const idToken = authHeader.slice(7);
  const { auth: adminAuth, db: adminDb } = getAdmin();

  let decodedIdToken;
  try {
    decodedIdToken = await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Failed to verify Firebase ID token', error);
    return jsonError(VIDEO_ERROR_CODES.AuthInvalid, 401);
  }

  let sessionPayload: SessionPayload;
  try {
    sessionPayload = jwt.verify(body.sessionToken, sessionSecret) as SessionPayload;
  } catch (error) {
    console.error('Session token verification failed', error);
    return jsonError(VIDEO_ERROR_CODES.AuthInvalid, 401);
  }

  if (sessionPayload.userId !== decodedIdToken.uid) {
    return jsonError(VIDEO_ERROR_CODES.UserMismatch, 403);
  }

  const appointmentSnap = await adminDb.collection('appointments').doc(sessionPayload.appointmentId).get();
  if (!appointmentSnap.exists) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentNotFound, 404);
  }

  const appointmentData = appointmentSnap.data() as AppointmentDoc;
  const appointmentStatus = String(appointmentData?.status || '').toLowerCase();
  const isDoctor = appointmentData?.doctorId === sessionPayload.userId;
  const isPatient = appointmentData?.patientId === sessionPayload.userId;

  if (!isDoctor && !isPatient) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentForbidden, 403);
  }

  if (['cancelled', 'canceled', 'rejected'].includes(appointmentStatus)) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentCancelled, 403);
  }

  if (['finished', 'completed'].includes(appointmentStatus)) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentFinished, 403);
  }

  if (isPatient && !appointmentData?.isPaid) {
    return jsonError(VIDEO_ERROR_CODES.PaymentRequired, 402);
  }

  return NextResponse.json({
    roomCode: sessionPayload.roomCode,
    appointmentId: sessionPayload.appointmentId,
    role: sessionPayload.role,
  });
}

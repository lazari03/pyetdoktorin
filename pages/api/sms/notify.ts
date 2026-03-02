import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdmin } from '@/app/api/_lib/admin';
import { normalizeRole } from '@/domain/rules/userRules';
import { UserRole } from '@/domain/entities/UserRole';
import {
  sendDoctorAppointmentRequestSms,
  sendPatientAppointmentAcceptedSms,
  sendPatientAppointmentReminderSms,
} from '@/infrastructure/services/smsService';

type SmsType = 'appointment-request' | 'appointment-accepted' | 'appointment-reminder';

type SmsNotifyBody = {
  type?: SmsType;
  doctorId?: string;
  patientId?: string;
  time?: string;
};

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX = 5;
const rateLimit = new Map<string, number[]>();

function getClientKey(req: NextApiRequest, uid?: string) {
  const xfwd = req.headers['x-forwarded-for'];
  const ip = Array.isArray(xfwd) ? xfwd[0] : xfwd?.split(',')[0]?.trim();
  return uid ? `uid:${uid}` : ip ? `ip:${ip}` : 'unknown';
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = rateLimit.get(key) ?? [];
  const recent = existing.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimit.set(key, recent);
    return true;
  }
  recent.push(now);
  rateLimit.set(key, recent);
  return false;
}

function getBearerToken(req: NextApiRequest) {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function getUserProfile(uid: string) {
  const { db } = getAdmin();
  const snap = await db.collection('users').doc(uid).get();
  const data = snap.data() as { role?: unknown; name?: unknown } | undefined;
  const role = normalizeRole(data?.role);
  const name = typeof data?.name === 'string' ? data?.name : null;
  return { role, name };
}

// POST /api/sms/notify-doctor
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = (req.body ?? {}) as SmsNotifyBody;
  const { type, doctorId, patientId, time } = body;

  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Missing authentication credentials' });
    }

    const { auth } = getAdmin();
    const decoded = await auth.verifyIdToken(token);
    const uid = decoded.uid;
    const user = await getUserProfile(uid);
    if (!user.role) {
      return res.status(403).json({ error: 'Role not approved' });
    }

    const limiterKey = `${getClientKey(req, uid)}:${type ?? 'unknown'}`;
    if (isRateLimited(limiterKey)) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (type === 'appointment-request') {
      if (!doctorId) throw new Error('Doctor ID not provided');
      // Only patients can trigger appointment-request notifications.
      if (user.role !== UserRole.Patient) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const patientName = user.name || 'A patient';
      await sendDoctorAppointmentRequestSms(doctorId, patientName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-accepted') {
      if (!patientId) throw new Error('Patient ID not provided');
      // Only doctors can trigger appointment-accepted notifications.
      if (user.role !== UserRole.Doctor) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const doctorName = user.name || 'Doctor';
      await sendPatientAppointmentAcceptedSms(patientId, doctorName);
      return res.status(200).json({ success: true });
    }
    if (type === 'appointment-reminder') {
      if (!patientId) throw new Error('Patient ID not provided');
      // Reminders should be server-triggered; allow only admins for now.
      if (user.role !== UserRole.Admin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const doctorName = user.name || 'Doctor';
      await sendPatientAppointmentReminderSms(patientId, doctorName, time || '');
      return res.status(200).json({ success: true });
    }
    return res.status(400).json({ error: 'Invalid type' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === 'VONAGE_NOT_CONFIGURED') {
      return res.status(500).json({ error: 'SMS_NOT_CONFIGURED' });
    }
    if (message === 'PHONE_NOT_FOUND') {
      return res.status(404).json({ error: 'PHONE_NOT_FOUND' });
    }
    return res.status(500).json({ error: 'SMS_SEND_FAILED', detail: process.env.NODE_ENV !== 'production' ? message : undefined });
  }
}

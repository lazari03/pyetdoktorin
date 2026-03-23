import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getAdmin } from '@/app/api/_lib/admin';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';
import { API_ENDPOINTS } from '@/config/routes';
import { SecurityAuditService } from '@/infrastructure/services/securityAuditService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AllowedRole = 'doctor' | 'patient';

type RoomCodeObj = {
  code: string;
  room_id: string;
  role: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

type RoomCodesResponse = {
  data?: RoomCodeObj[];
  [key: string]: unknown;
};

type AppointmentDoc = {
  doctorId?: string;
  patientId?: string;
  status?: string;
  isPaid?: boolean;
  roomId?: string;
  roomCode?: string;
};

type RequestBody = {
  user_id?: unknown;
  room_id?: unknown;
  role?: unknown;
  template_id?: unknown;
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function getHmsBase(): URL {
  const base = API_ENDPOINTS.HMS_BASE_URL.endsWith('/')
    ? API_ENDPOINTS.HMS_BASE_URL
    : `${API_ENDPOINTS.HMS_BASE_URL}/`;
  return new URL(base);
}

function isSafeId(value: unknown, { min = 6, max = 128 } = {}): value is string {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) return false;
  if (trimmed.includes('..')) return false;
  if (/[\\/]/.test(trimmed)) return false;
  if (trimmed.includes('://')) return false;
  return /^[A-Za-z0-9_-]+$/.test(trimmed);
}

function normalizeRole(value: unknown): AllowedRole | null {
  if (typeof value !== 'string') return null;
  const role = value.trim().toLowerCase();
  if (role === 'doctor' || role === 'patient') return role;
  return null;
}

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const [first] = forwarded.split(',');
    const trimmed = first?.trim();
    if (trimmed) return trimmed;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return undefined;
}

function isUuid(value: string): boolean {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function syncPaymentIfPossible(appointmentId: string, idToken: string) {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:4000';

  try {
    const res = await fetch(`${backendUrl}/api/paddle/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ appointmentId }),
    });
    return res.ok;
  } catch (error) {
    console.warn('Payment sync request failed', error);
    return false;
  }
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

  const authenticatedUserId = decodedIdToken.uid;
  const roomIdParam = body.room_id;
  const userIdParam = body.user_id;
  const safeRole = normalizeRole(body.role);
  const templateId =
    typeof body.template_id === 'string' && body.template_id.trim().length > 0
      ? body.template_id.trim()
      : process.env.HMS_TEMPLATE_ID;

  if (
    typeof userIdParam !== 'string' ||
    typeof roomIdParam !== 'string' ||
    !safeRole ||
    !isSafeId(roomIdParam)
  ) {
    return jsonError(VIDEO_ERROR_CODES.MissingParams, 400);
  }

  if (userIdParam !== authenticatedUserId) {
    await new SecurityAuditService().logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: roomIdParam,
      role: safeRole,
      success: false,
      reason: 'user_mismatch',
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
    });
    return jsonError(VIDEO_ERROR_CODES.UserMismatch, 403);
  }

  const appointmentSnap = await adminDb.collection('appointments').doc(roomIdParam).get();
  if (!appointmentSnap.exists) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentNotFound, 404);
  }

  let appointmentData = appointmentSnap.data() as AppointmentDoc;
  const appointmentStatus = String(appointmentData?.status || '').toLowerCase();
  const isDoctor = appointmentData?.doctorId === authenticatedUserId;
  const isPatient = appointmentData?.patientId === authenticatedUserId;
  let isPaid = Boolean(appointmentData?.isPaid);

  if (!isDoctor && !isPatient) {
    await new SecurityAuditService().logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: roomIdParam,
      role: safeRole,
      success: false,
      reason: 'not_assigned_to_appointment',
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
    });
    return jsonError(VIDEO_ERROR_CODES.AppointmentForbidden, 403);
  }

  const isCancelled = ['cancelled', 'canceled', 'rejected'].includes(appointmentStatus);
  const isFinished = ['finished', 'completed'].includes(appointmentStatus);
  const isAccepted = appointmentStatus === 'accepted';

  if (isCancelled) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentCancelled, 403);
  }
  if (isFinished) {
    return jsonError(VIDEO_ERROR_CODES.AppointmentFinished, 403);
  }

  if ((isDoctor || isPatient) && !isPaid) {
    await syncPaymentIfPossible(roomIdParam, idToken);
    const refreshedSnap = await adminDb.collection('appointments').doc(roomIdParam).get();
    if (refreshedSnap.exists) {
      appointmentData = refreshedSnap.data() as AppointmentDoc;
      isPaid = Boolean(appointmentData?.isPaid);
    }
  }

  if (isPatient) {
    if (!isPaid) {
      await new SecurityAuditService().logVideoAccessAttempt({
        userId: authenticatedUserId,
        appointmentId: roomIdParam,
        role: safeRole,
        success: false,
        reason: 'payment_required',
        ip: getClientIp(req),
        userAgent: req.headers.get('user-agent') ?? undefined,
      });
      return jsonError(VIDEO_ERROR_CODES.PaymentRequired, 402);
    }
    if (!isAccepted) {
      await new SecurityAuditService().logVideoAccessAttempt({
        userId: authenticatedUserId,
        appointmentId: roomIdParam,
        role: safeRole,
        success: false,
        reason: 'appointment_not_accepted',
        ip: getClientIp(req),
        userAgent: req.headers.get('user-agent') ?? undefined,
      });
      return jsonError(VIDEO_ERROR_CODES.AppointmentNotAccepted, 403);
    }
  }

  if (isDoctor && !isPaid) {
    return jsonError(VIDEO_ERROR_CODES.PaymentRequired, 402);
  }

  const expectedRole: AllowedRole = isDoctor ? 'doctor' : 'patient';
  if (safeRole !== expectedRole) {
    return jsonError(VIDEO_ERROR_CODES.RoleNotAllowed, 403);
  }

  const accessKey = process.env.HMS_ACCESS_KEY;
  const accessSecret = process.env.HMS_SECRET;
  const hmsTemplateId = process.env.HMS_TEMPLATE_ID;
  if (!accessKey || !accessSecret) {
    return jsonError(VIDEO_ERROR_CODES.HmsConfigMissing, 500);
  }
  if (!hmsTemplateId && !templateId) {
    return jsonError(VIDEO_ERROR_CODES.TemplateMissing, 500);
  }

  const now = Math.floor(Date.now() / 1000);
  const managementToken = jwt.sign(
    {
      access_key: accessKey,
      type: 'management',
      version: 2,
      iat: now,
      nbf: now,
    },
    accessSecret,
    {
      algorithm: 'HS256',
      expiresIn: '30m',
      jwtid: uuidv4(),
    },
  );

  try {
    let actualRoomId =
      typeof appointmentData?.roomId === 'string' && isUuid(appointmentData.roomId)
        ? appointmentData.roomId
        : roomIdParam;

    if (!isUuid(actualRoomId)) {
      const createRoomUrl = new URL('rooms', getHmsBase());
      const createRoomRes = await fetch(createRoomUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managementToken}`,
        },
        body: JSON.stringify({
          name: roomIdParam,
          template_id: templateId || hmsTemplateId,
        }),
      });
      const createRoomRaw = await createRoomRes.text();
      let createRoomData: Record<string, unknown> = {};
      try {
        createRoomData = createRoomRaw ? JSON.parse(createRoomRaw) : {};
      } catch {
        console.error('Error parsing 100ms create room response', createRoomRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, 500);
      }
      if (!createRoomRes.ok || !createRoomData.id || typeof createRoomData.id !== 'string') {
        console.error('100ms create room failed', createRoomRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, createRoomRes.status || 500);
      }

      actualRoomId = createRoomData.id;

      const createCodesUrl = new URL(`room-codes/room/${encodeURIComponent(actualRoomId)}`, getHmsBase());
      const createCodesRes = await fetch(createCodesUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${managementToken}`,
        },
      });
      const createCodesRaw = await createCodesRes.text();
      let createCodesData: RoomCodesResponse = {};
      try {
        createCodesData = createCodesRaw ? JSON.parse(createCodesRaw) : {};
      } catch {
        console.error('Error parsing 100ms create room codes response', createCodesRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, 500);
      }
      if (!createCodesRes.ok || !Array.isArray(createCodesData.data)) {
        console.error('100ms create room codes failed', createCodesRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, createCodesRes.status || 500);
      }

      await sleep(2000);
    } else {
      const getRoomUrl = new URL(`rooms/${encodeURIComponent(actualRoomId)}`, getHmsBase());
      const getRoomRes = await fetch(getRoomUrl.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      });
      const getRoomRaw = await getRoomRes.text();
      let getRoomData: Record<string, unknown> = {};
      try {
        getRoomData = getRoomRaw ? JSON.parse(getRoomRaw) : {};
      } catch {
        console.error('Error parsing 100ms get room response', getRoomRaw);
      }
      if (!getRoomRes.ok || !getRoomData.id) {
        console.error('100ms get room failed', getRoomRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, getRoomRes.status || 500);
      }

      for (const roleToEnsure of ['doctor', 'patient'] as const) {
        const getCodeUrl = new URL(`room-codes/room/${encodeURIComponent(actualRoomId)}`, getHmsBase());
        getCodeUrl.searchParams.set('role', roleToEnsure);
        getCodeUrl.searchParams.set('enabled', 'true');

        const getCodeRes = await fetch(getCodeUrl.toString(), {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${managementToken}`,
          },
        });
        const getCodeRaw = await getCodeRes.text();
        let getCodeData: RoomCodesResponse = {};
        try {
          getCodeData = getCodeRaw ? JSON.parse(getCodeRaw) : {};
        } catch {
          console.warn('Error parsing 100ms get room code response', getCodeRaw);
        }

        const codeExists = Array.isArray(getCodeData.data)
          ? getCodeData.data.some((roomCode) => roomCode.enabled && roomCode.role === roleToEnsure)
          : false;

        if (!codeExists) {
          await fetch(new URL('room-codes', getHmsBase()).toString(), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${managementToken}`,
            },
            body: JSON.stringify({
              room_id: actualRoomId,
              role: roleToEnsure,
              enabled: true,
            }),
          });
        }
      }

      await sleep(2000);
    }

    let roomCode =
      typeof appointmentData?.roomCode === 'string' && appointmentData.roomCode.trim().length > 0
        ? appointmentData.roomCode
        : null;

    const getRoomCodesUrl = new URL(`room-codes/room/${encodeURIComponent(actualRoomId)}`, getHmsBase());
    getRoomCodesUrl.searchParams.set('role', expectedRole);
    getRoomCodesUrl.searchParams.set('enabled', 'true');

    const getRoomCodesRes = await fetch(getRoomCodesUrl.toString(), {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${managementToken}`,
      },
    });
    const getRoomCodesRaw = await getRoomCodesRes.text();
    let getRoomCodesData: RoomCodesResponse = {};
    try {
      getRoomCodesData = getRoomCodesRaw ? JSON.parse(getRoomCodesRaw) : {};
    } catch {
      console.error('Error parsing 100ms room codes response', getRoomCodesRaw);
      return jsonError(VIDEO_ERROR_CODES.GenericFailed, 500);
    }

    const roomCodesArr = getRoomCodesData.data;
    roomCode = Array.isArray(roomCodesArr) && roomCodesArr.length > 0 ? roomCodesArr[0].code : roomCode;

    if (!roomCode) {
      const getAllRoomCodesUrl = new URL(`room-codes/room/${encodeURIComponent(actualRoomId)}`, getHmsBase());
      const getAllRoomCodesRes = await fetch(getAllRoomCodesUrl.toString(), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      });
      const getAllRoomCodesRaw = await getAllRoomCodesRes.text();
      let getAllRoomCodesData: RoomCodesResponse = {};
      try {
        getAllRoomCodesData = getAllRoomCodesRaw ? JSON.parse(getAllRoomCodesRaw) : {};
      } catch {
        console.error('Error parsing 100ms all room codes response', getAllRoomCodesRaw);
        return jsonError(VIDEO_ERROR_CODES.GenericFailed, 500);
      }

      const prebuiltCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
      roomCode = Array.isArray(getAllRoomCodesData.data)
        ? getAllRoomCodesData.data.find(
            (entry) =>
              entry.enabled &&
              typeof entry.code === 'string' &&
              prebuiltCodeRegex.test(entry.code),
          )?.code ?? null
        : null;

      if (!roomCode) {
        const createRoomCodeRes = await fetch(new URL('room-codes', getHmsBase()).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${managementToken}`,
          },
          body: JSON.stringify({
            room_id: actualRoomId,
            role: expectedRole,
            enabled: true,
          }),
        });
        const createRoomCodeRaw = await createRoomCodeRes.text();
        let createRoomCodeData: Record<string, unknown> = {};
        try {
          createRoomCodeData = createRoomCodeRaw ? JSON.parse(createRoomCodeRaw) : {};
        } catch {
          console.error('Error parsing 100ms create room code response', createRoomCodeRaw);
          return jsonError(VIDEO_ERROR_CODES.GenericFailed, 500);
        }
        if (!createRoomCodeRes.ok || typeof createRoomCodeData.code !== 'string') {
          console.error('100ms create room code failed', createRoomCodeRaw);
          return jsonError(VIDEO_ERROR_CODES.GenericFailed, createRoomCodeRes.status || 500);
        }
        roomCode = createRoomCodeData.code;
      }
    }

    const appToken = jwt.sign(
      {
        access_key: accessKey,
        room_id: actualRoomId,
        user_id: userIdParam,
        role: expectedRole,
        type: 'app',
        version: 2,
        iat: now,
        nbf: now,
      },
      accessSecret,
      {
        algorithm: 'HS256',
        expiresIn: '30m',
        jwtid: uuidv4(),
      },
    );

    const sessionToken = jwt.sign(
      {
        userId: authenticatedUserId,
        appointmentId: roomIdParam,
        role: expectedRole,
        roomCode,
        roomUUID: actualRoomId,
      },
      sessionSecret,
      {
        algorithm: 'HS256',
        expiresIn: '5m',
        jwtid: uuidv4(),
      },
    );

    await new SecurityAuditService().logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: roomIdParam,
      role: expectedRole,
      success: true,
      ip: getClientIp(req),
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({
      token: appToken,
      room_id: actualRoomId,
      roomCode,
      sessionToken,
    });
  } catch (error) {
    console.error('100ms generate-token failed', error);
    return jsonError(
      error instanceof Error && error.message ? error.message : VIDEO_ERROR_CODES.GenericFailed,
      500,
    );
  }
}

// Type for 100ms room codes API response
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
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { getAdmin } from '@/app/api/_lib/admin';

import { SecurityAuditService } from '@/infrastructure/services/securityAuditService';
import { API_ENDPOINTS } from '@/config/routes';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';
const HMS_BASE_URL = API_ENDPOINTS.HMS_BASE_URL;

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: VIDEO_ERROR_CODES.MethodNotAllowed });
  }
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    return res.status(500).json({ error: VIDEO_ERROR_CODES.SessionSecretMissing });
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

  const authenticatedUserId = decodedIdToken.uid;

  const { user_id, room_id, role } = req.body;
  // Use template_id from request body, env var, or fallback
  const template_id = req.body.template_id || process.env.HMS_TEMPLATE_ID;
  if (!user_id || !room_id || !role) {
    return res.status(400).json({ error: VIDEO_ERROR_CODES.MissingParams });
  }

  if (user_id !== authenticatedUserId) {
    const auditService = new SecurityAuditService();
    await auditService.logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: room_id,
      role,
      success: false,
      reason: 'user_mismatch',
      ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    return res.status(403).json({ error: VIDEO_ERROR_CODES.UserMismatch });
  }

  const appointmentSnap = await adminDb.collection('appointments').doc(room_id).get();
  if (!appointmentSnap.exists) {
    return res.status(404).json({ error: VIDEO_ERROR_CODES.AppointmentNotFound });
  }

  let appointmentData = appointmentSnap.data() as AppointmentDoc;
  const appointmentStatus = (appointmentData?.status || '').toString().toLowerCase();
  const isDoctor = appointmentData?.doctorId === authenticatedUserId;
  const isPatient = appointmentData?.patientId === authenticatedUserId;
  let isPaid = Boolean(appointmentData?.isPaid);

  if (!isDoctor && !isPatient) {
    const auditService = new SecurityAuditService();
    await auditService.logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: room_id,
      role,
      success: false,
      reason: 'not_assigned_to_appointment',
      ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
    return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentForbidden });
  }

  const isCancelled = ['cancelled', 'canceled', 'rejected'].includes(appointmentStatus);
  const isFinished = ['finished', 'completed'].includes(appointmentStatus);
  const isAccepted = appointmentStatus === 'accepted';

  if (isCancelled) {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentCancelled });
  }
  if (isFinished) {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentFinished });
  }

  if ((isPatient || isDoctor) && !isPaid) {
    await syncPaymentIfPossible(room_id, idToken);
    const refreshedSnap = await adminDb.collection('appointments').doc(room_id).get();
    if (refreshedSnap.exists) {
      appointmentData = refreshedSnap.data() as AppointmentDoc;
      isPaid = Boolean(appointmentData?.isPaid);
    }
  }

  if (isPatient) {
    if (!isPaid) {
      const auditService = new SecurityAuditService();
      await auditService.logVideoAccessAttempt({
        userId: authenticatedUserId,
        appointmentId: room_id,
        role,
        success: false,
        reason: 'payment_required',
        ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      return res.status(402).json({ error: VIDEO_ERROR_CODES.PaymentRequired });
    }
    if (!isAccepted) {
      const auditService = new SecurityAuditService();
      await auditService.logVideoAccessAttempt({
        userId: authenticatedUserId,
        appointmentId: room_id,
        role,
        success: false,
        reason: 'appointment_not_accepted',
        ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });
      return res.status(403).json({ error: VIDEO_ERROR_CODES.AppointmentNotAccepted });
    }
  }

  if (isDoctor && !isPaid) {
    return res.status(402).json({ error: VIDEO_ERROR_CODES.PaymentRequired });
  }

  const expectedRole = isDoctor ? 'doctor' : 'patient';
  if (role !== expectedRole) {
    return res.status(403).json({ error: VIDEO_ERROR_CODES.RoleNotAllowed });
  }

  const accessKey = process.env.HMS_ACCESS_KEY;
  const accessSecret = process.env.HMS_SECRET;
  const hmsTemplateId = process.env.HMS_TEMPLATE_ID;
  if (!accessKey || !accessSecret) {
    return res.status(500).json({ error: VIDEO_ERROR_CODES.HmsConfigMissing });
  }
  if (!hmsTemplateId && !template_id) {
    return res.status(500).json({ error: VIDEO_ERROR_CODES.TemplateMissing });
  }
  // Always generate management token on the fly
  const now = Math.floor(Date.now() / 1000);
  const managementToken = jwt.sign(
    {
      access_key: accessKey,
      type: 'management',
      version: 2,
      iat: now,
      nbf: now
    },
    accessSecret,
    {
      algorithm: 'HS256',
      expiresIn: '30m',
      jwtid: uuidv4()
    }
  );

  try {
    // Step 1: Create a room if room_id is not a valid 100ms room ID (assume not a UUID)
    let actualRoomId = room_id;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(room_id)) {
      // Create a new room using the template_id (must be set in dashboard)
      const createRoomRes = await fetch(`${HMS_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        },
        body: JSON.stringify({
          name: room_id,
          template_id: template_id || hmsTemplateId
        })
      });
      const createRoomRaw = await createRoomRes.text();
      let createRoomData: Record<string, unknown> = {};
      try {
        createRoomData = createRoomRaw ? JSON.parse(createRoomRaw) : {};
      } catch {
      console.error('Error parsing 100ms create room response', createRoomRaw);
        return res.status(500).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      if (!createRoomRes.ok || !createRoomData.id) {
        console.error('100ms create room failed', createRoomRaw);
        return res.status(createRoomRes.status).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      actualRoomId = createRoomData.id;
      // --- Create room codes for all roles in the room at once ---
      const createCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        }
      });
      const createCodesRaw = await createCodesRes.text();
      let createCodesData: { data?: RoomCodeObj[] } = {};
      try {
        createCodesData = createCodesRaw ? JSON.parse(createCodesRaw) : {};
      } catch {
      console.error('Error parsing 100ms create room codes response', createCodesRaw);
        return res.status(500).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      if (!createCodesRes.ok || !Array.isArray(createCodesData.data)) {
        console.error('100ms create room codes failed', createCodesRaw);
        return res.status(createCodesRes.status).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      // Wait a moment for codes to be available
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      // Fetch the room details to ensure it exists
      const getRoomRes = await fetch(`${HMS_BASE_URL}/rooms/${room_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
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
        return res.status(getRoomRes.status).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      actualRoomId = getRoomData.id;
      // --- Automate room code creation for both doctor and patient roles for existing rooms ---
      const rolesToEnsure = ['doctor', 'patient'];
      for (const r of rolesToEnsure) {
        const getCodeRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}?role=${r}&enabled=true`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${managementToken}`
          }
        });
        const getCodeRaw = await getCodeRes.text();
        let getCodeData: RoomCodesResponse = {};
        try {
          getCodeData = getCodeRaw ? JSON.parse(getCodeRaw) : {};
        } catch {
          // Error parsing 100ms get room code response as JSON
        }
        const codeExists = Array.isArray(getCodeData.data)
          ? getCodeData.data.some((rc: RoomCodeObj) => rc.enabled && rc.role === r)
          : false;
        if (!codeExists) {
          await fetch(`${HMS_BASE_URL}/room-codes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${managementToken}`
            },
            body: JSON.stringify({
              room_id: actualRoomId,
              role: r,
              enabled: true
            })
          });
        }
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    // Always fetch the room code for the given room and role
    let roomCode = null;
    const getRoomCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}?role=${role}&enabled=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managementToken}`
      }
    });
    const getRoomCodesRaw = await getRoomCodesRes.text();
    let getRoomCodesData: RoomCodesResponse = {};
    try {
      getRoomCodesData = getRoomCodesRaw ? JSON.parse(getRoomCodesRaw) : {};
    } catch {
      console.error('Error parsing 100ms room codes response', getRoomCodesRaw);
      return res.status(500).json({ error: VIDEO_ERROR_CODES.GenericFailed });
    }
    const roomCodesArr = getRoomCodesData.data;
    roomCode = Array.isArray(roomCodesArr) && roomCodesArr.length > 0 ? roomCodesArr[0].code : null;
    if (!roomCode) {
      // Try to fetch all room codes for this room and pick the first enabled one with a code format like 'efg-mqpc-zbb'
      const getAllRoomCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });
      const getAllRoomCodesRaw = await getAllRoomCodesRes.text();
      let getAllRoomCodesData: RoomCodesResponse = {};
      try {
        getAllRoomCodesData = getAllRoomCodesRaw ? JSON.parse(getAllRoomCodesRaw) : {};
      } catch {
        console.error('Error parsing 100ms all room codes response', getAllRoomCodesRaw);
        return res.status(500).json({ error: VIDEO_ERROR_CODES.GenericFailed });
      }
      const allRoomCodesArr = getAllRoomCodesData.data;
      // Find the first enabled room code that matches the prebuilt format (3 groups of 3 lowercase letters)
      const prebuiltCodeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
      roomCode = Array.isArray(allRoomCodesArr) && allRoomCodesArr.length > 0 ?
        (allRoomCodesArr.find((rc: RoomCodeObj) => rc.enabled && typeof rc.code === 'string' && prebuiltCodeRegex.test(rc.code))?.code || null)
        : null;
      if (!roomCode) {
        // Try to create a room code for this role
  // No enabled prebuilt roomCode found for this room. Attempting to create one.
        const createRoomCodeRes = await fetch(`${HMS_BASE_URL}/room-codes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${managementToken}`
          },
          body: JSON.stringify({
            room_id: actualRoomId,
            role,
            enabled: true
          })
        });
        const createRoomCodeRaw = await createRoomCodeRes.text();
  // Error creating room code response
        let createRoomCodeData: Record<string, unknown> = {};
        try {
          createRoomCodeData = createRoomCodeRaw ? JSON.parse(createRoomCodeRaw) : {};
        } catch {
          console.error('Error parsing 100ms create room code response', createRoomCodeRaw);
          return res.status(500).json({ error: VIDEO_ERROR_CODES.GenericFailed });
        }
        if (!createRoomCodeRes.ok || !createRoomCodeData.code) {
          // Log a clear message if Prebuilt is blocking room code creation
          if (createRoomCodeRes.status === 404) {
            // 100ms Prebuilt BLOCKED: Room code creation failed with 404. Prebuilt not initialized for this room/role.
          }
          console.error('100ms create room code failed', createRoomCodeRaw);
          return res.status(createRoomCodeRes.status).json({ error: VIDEO_ERROR_CODES.GenericFailed });
        }
        roomCode = createRoomCodeData.code as string;
      }
    }

    // Step 2: Generate the token for the (possibly newly created) room using JWT
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      access_key: accessKey,
      room_id: actualRoomId,
      user_id,
      role,
      type: 'app',
      version: 2,
      iat: now,
      nbf: now
      // Do NOT set exp here, let expiresIn handle it
    };
    const token = jwt.sign(payload, accessSecret, {
      algorithm: 'HS256',
      expiresIn: '30m',
      jwtid: uuidv4()
    });

    const sessionToken = jwt.sign(
      {
        userId: authenticatedUserId,
        appointmentId: room_id,
        role: expectedRole,
        roomCode,
        roomUUID: actualRoomId,
      },
      sessionSecret,
      {
        algorithm: 'HS256',
        expiresIn: '5m',
        jwtid: uuidv4(),
      }
    );

    // Log successful access
    const auditService = new SecurityAuditService();
    await auditService.logVideoAccessAttempt({
      userId: authenticatedUserId,
      appointmentId: room_id,
      role: expectedRole,
      success: true,
      ip: req.headers['x-forwarded-for']?.toString() || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
    });

    // Response: token (JWT), room_id (UUID), roomCode (Prebuilt code), session token for app validation
    return res.status(200).json({ token, room_id: actualRoomId, roomCode, sessionToken });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

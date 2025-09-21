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

import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
const HMS_BASE_URL = 'https://api.100ms.live/v2';

// Debug log utility (only logs in development)
function debugLog(...args: any[]) {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log('[100ms-generate-token]', ...args);
  }
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  debugLog('Request method:', req.method);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }




  debugLog('Request body:', req.body);
  const { user_id, room_id, role } = req.body;
  // Always use the correct template_id for Prebuilt UI
  const template_id = req.body.template_id || '68cfdc0774147bd574bb2a3f';
  if (!user_id || !room_id || !role) {
    debugLog('Missing required fields:', { user_id, room_id, role });
    return res.status(400).json({ error: 'Missing user_id, room_id, or role' });
  }


  const accessKey = process.env.HMS_ACCESS_KEY;
  const accessSecret = process.env.HMS_SECRET;
  debugLog('Loaded HMS_ACCESS_KEY:', accessKey ? '[set]' : '[missing]');
  debugLog('Loaded HMS_SECRET:', accessSecret ? '[set]' : '[missing]');
  if (!accessKey || !accessSecret) {
    debugLog('Missing HMS keys in environment');
    return res.status(500).json({ error: '100ms access key/secret not set in environment' });
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
    debugLog('Starting 100ms token generation logic...');
    // Step 1: Create a room if room_id is not a valid 100ms room ID (assume not a UUID)
    let actualRoomId = room_id;
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(room_id)) {
      debugLog('Room ID is not a UUID, will create new room:', room_id);
      // Create a new room using the template_id (must be set in dashboard)
      debugLog('Creating room with name:', room_id, 'and template_id:', template_id);
      const createRoomRes = await fetch(`${HMS_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        },
        body: JSON.stringify({
          name: room_id,
          template_id: template_id || undefined
        })
      });
  const createRoomRaw = await createRoomRes.text();
  debugLog('Create room response:', createRoomRaw);
      let createRoomData: Record<string, unknown> = {};
      try {
        createRoomData = createRoomRaw ? JSON.parse(createRoomRaw) : {};
      } catch {
  // Error parsing 100ms create room response as JSON
        return res.status(500).json({ error: 'Invalid response from 100ms (create room)', raw: createRoomRaw });
      }
      if (!createRoomRes.ok || !createRoomData.id) {
        debugLog('Failed to create room:', createRoomData);
        return res.status(createRoomRes.status).json({ error: createRoomData.error || 'Failed to create 100ms room', raw: createRoomRaw });
      }
      actualRoomId = createRoomData.id;
      // --- Create room codes for all roles in the room at once ---
      debugLog('Creating room codes for room:', actualRoomId);
      const createCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${managementToken}`
        }
      });
  const createCodesRaw = await createCodesRes.text();
  debugLog('Create room codes response:', createCodesRaw);
      let createCodesData: { data?: RoomCodeObj[] } = {};
      try {
        createCodesData = createCodesRaw ? JSON.parse(createCodesRaw) : {};
      } catch {
  // Error parsing 100ms create room codes response as JSON
        return res.status(500).json({ error: 'Invalid response from 100ms (create room codes)', raw: createCodesRaw });
      }
      if (!createCodesRes.ok || !Array.isArray(createCodesData.data)) {
        debugLog('Failed to create room codes:', createCodesData);
        return res.status(createCodesRes.status).json({ error: 'Failed to create 100ms room codes', raw: createCodesRaw });
      }
      // Wait a moment for codes to be available
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      // Fetch the room details to ensure it exists
      debugLog('Fetching existing room:', room_id);
      const getRoomRes = await fetch(`${HMS_BASE_URL}/rooms/${room_id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });
  const getRoomRaw = await getRoomRes.text();
  debugLog('Get room response:', getRoomRaw);
      let getRoomData: Record<string, unknown> = {};
      try {
        getRoomData = getRoomRaw ? JSON.parse(getRoomRaw) : {};
      } catch {
  // Error parsing 100ms get room response as JSON
      }
      if (!getRoomRes.ok || !getRoomData.id) {
        debugLog('Failed to fetch room:', getRoomData);
        return res.status(getRoomRes.status).json({ error: getRoomData.error || 'Failed to fetch 100ms room', raw: getRoomRaw });
      }
      actualRoomId = getRoomData.id;
      // --- Automate room code creation for both doctor and patient roles for existing rooms ---
      const rolesToEnsure = ['doctor', 'patient'];
      for (const r of rolesToEnsure) {
        debugLog('Fetching room code for role:', r, 'room:', actualRoomId);
        const getCodeRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}?role=${r}&enabled=true`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${managementToken}`
          }
        });
  const getCodeRaw = await getCodeRes.text();
  debugLog('Get code response:', getCodeRaw);
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
          debugLog('Room code for role', r, 'does not exist, creating...');
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
    debugLog('Fetching room code for requested role:', role, 'room:', actualRoomId);
    const getRoomCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}?role=${role}&enabled=true`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${managementToken}`
      }
    });
  const getRoomCodesRaw = await getRoomCodesRes.text();
  debugLog('Get room codes response:', getRoomCodesRaw);
    let getRoomCodesData: RoomCodesResponse = {};
    try {
      getRoomCodesData = getRoomCodesRaw ? JSON.parse(getRoomCodesRaw) : {};
    } catch {
  // Error parsing 100ms get room codes response as JSON
      return res.status(500).json({ error: 'Invalid response from 100ms (get room codes)', raw: getRoomCodesRaw });
    }
    const roomCodesArr = getRoomCodesData.data;
    roomCode = Array.isArray(roomCodesArr) && roomCodesArr.length > 0 ? roomCodesArr[0].code : null;
    if (!roomCode) {
      // Try to fetch all room codes for this room and pick the first enabled one with a code format like 'efg-mqpc-zbb'
      debugLog('No room code found for role, fetching all room codes for room:', actualRoomId);
      const getAllRoomCodesRes = await fetch(`${HMS_BASE_URL}/room-codes/room/${actualRoomId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${managementToken}`
        }
      });
  const getAllRoomCodesRaw = await getAllRoomCodesRes.text();
  debugLog('Get all room codes response:', getAllRoomCodesRaw);
      let getAllRoomCodesData: RoomCodesResponse = {};
      try {
        getAllRoomCodesData = getAllRoomCodesRaw ? JSON.parse(getAllRoomCodesRaw) : {};
      } catch {
  // Error parsing 100ms get all room codes response as JSON
        return res.status(500).json({ error: 'Invalid response from 100ms (get all room codes)', raw: getAllRoomCodesRaw });
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
        debugLog('No enabled prebuilt room code found, creating one for role:', role);
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
  debugLog('Create room code response:', createRoomCodeRaw);
  // Error creating room code response
        let createRoomCodeData: Record<string, unknown> = {};
        try {
          createRoomCodeData = createRoomCodeRaw ? JSON.parse(createRoomCodeRaw) : {};
        } catch {
          // Error parsing 100ms create room code response as JSON
          return res.status(500).json({ error: 'Invalid response from 100ms (create room code)', raw: createRoomCodeRaw });
        }
        if (!createRoomCodeRes.ok || !createRoomCodeData.code) {
          // Log a clear message if Prebuilt is blocking room code creation
          if (createRoomCodeRes.status === 404) {
            // 100ms Prebuilt BLOCKED: Room code creation failed with 404. Prebuilt not initialized for this room/role.
          }
          return res.status(createRoomCodeRes.status).json({
            error: createRoomCodeData.error || 'Failed to create 100ms room code',
            raw: createRoomCodeRaw,
            request: {
              room_id: actualRoomId,
              role,
              enabled: true
            }
          });
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
  debugLog('Generating JWT token for user:', user_id, 'room:', actualRoomId, 'role:', role);
  const token = jwt.sign(payload, accessSecret, {
      algorithm: 'HS256',
      expiresIn: '30m',
      jwtid: uuidv4()
    });
    // Response: token (JWT), room_id (UUID), roomCode (Prebuilt code)
  debugLog('Token generated successfully. Returning response.');
  return res.status(200).json({ token, room_id: actualRoomId, roomCode });
  } catch (error) {
    debugLog('Error in handler:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

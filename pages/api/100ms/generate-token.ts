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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }



  const { user_id, room_id, role } = req.body;
  // Always use the correct template_id for Prebuilt UI
  const template_id = req.body.template_id || '68811a0774147bd574ba97d9';
  if (!user_id || !room_id || !role) {
    return res.status(400).json({ error: 'Missing user_id, room_id, or role' });
  }

  const managementToken = process.env.HMS_MANAGEMENT_TOKEN;
  const accessKey = process.env.HMS_ACCESS_KEY;
  const accessSecret = process.env.HMS_SECRET;
  if (!managementToken) {
    return res.status(500).json({ error: '100ms management token not set in environment' });
  }
  if (!accessKey || !accessSecret) {
    return res.status(500).json({ error: '100ms access key/secret not set in environment' });
  }

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
          template_id: template_id || undefined
        })
      });
      const createRoomRaw = await createRoomRes.text();
      let createRoomData: Record<string, unknown> = {};
      try {
        createRoomData = createRoomRaw ? JSON.parse(createRoomRaw) : {};
      } catch {
        console.error('Failed to parse 100ms create room response as JSON:', createRoomRaw);
        return res.status(500).json({ error: 'Invalid response from 100ms (create room)', raw: createRoomRaw });
      }
      if (!createRoomRes.ok || !createRoomData.id) {
        return res.status(createRoomRes.status).json({ error: createRoomData.error || 'Failed to create 100ms room', raw: createRoomRaw });
      }
      actualRoomId = createRoomData.id;
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
        console.error('Failed to parse 100ms get room response as JSON:', getRoomRaw);
      }
      if (!getRoomRes.ok || !getRoomData.id) {
        return res.status(getRoomRes.status).json({ error: getRoomData.error || 'Failed to fetch 100ms room', raw: getRoomRaw });
      }
      actualRoomId = getRoomData.id;
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
      console.error('Failed to parse 100ms get room codes response as JSON:', getRoomCodesRaw);
      return res.status(500).json({ error: 'Invalid response from 100ms (get room codes)', raw: getRoomCodesRaw });
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
        console.error('Failed to parse 100ms get all room codes response as JSON:', getAllRoomCodesRaw);
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
        console.error('No enabled prebuilt roomCode found for this room. Attempting to create one.');
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
        console.error('Create room code response:', createRoomCodeRaw);
        let createRoomCodeData: Record<string, unknown> = {};
        try {
          createRoomCodeData = createRoomCodeRaw ? JSON.parse(createRoomCodeRaw) : {};
        } catch {
          console.error('Failed to parse 100ms create room code response as JSON:', createRoomCodeRaw);
          return res.status(500).json({ error: 'Invalid response from 100ms (create room code)', raw: createRoomCodeRaw });
        }
        if (!createRoomCodeRes.ok || !createRoomCodeData.code) {
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
    const token = jwt.sign(payload, accessSecret, {
      algorithm: 'HS256',
      expiresIn: '30m',
      jwtid: uuidv4()
    });
    // Response: token (JWT), room_id (UUID), roomCode (Prebuilt code)
    return res.status(200).json({ token, room_id: actualRoomId, roomCode });
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
}

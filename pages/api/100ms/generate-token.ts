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
      let createRoomData: any = {};
      try {
        createRoomData = createRoomRaw ? JSON.parse(createRoomRaw) : {};
      } catch (e) {
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
      let getRoomData: any = {};
      try {
        getRoomData = getRoomRaw ? JSON.parse(getRoomRaw) : {};
      } catch (e) {
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
    let getRoomCodesData: any = {};
    try {
      getRoomCodesData = getRoomCodesRaw ? JSON.parse(getRoomCodesRaw) : {};
    } catch (e) {
      console.error('Failed to parse 100ms get room codes response as JSON:', getRoomCodesRaw);
      return res.status(500).json({ error: 'Invalid response from 100ms (get room codes)', raw: getRoomCodesRaw });
    }
    roomCode = getRoomCodesData.data?.[0]?.code || null;
    if (!roomCode) {
      console.error('No roomCode returned from 100ms API (room-codes):', getRoomCodesData);
      return res.status(500).json({ error: 'No roomCode returned from 100ms API (room-codes)', raw: getRoomCodesData });
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

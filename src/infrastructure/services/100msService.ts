import type { GenerateRoomCodeAndTokenResponse } from '@/models/100msTypes';
import { VIDEO_ERROR_CODES } from '@/config/errorCodes';

export async function generateRoomCodeAndToken({ user_id, room_id, role, template_id, idToken }: {
  user_id: string;
  room_id: string;
  role: string;
  template_id?: string;
  idToken: string;
}) {
  const response = await fetch('/api/100ms/generate-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ user_id, room_id, role, template_id }),
  });
  const text = await response.text();
  let data: GenerateRoomCodeAndTokenResponse = {};
  try { if (text) data = JSON.parse(text); } catch {}
  if (!response.ok) {
    const errorCode =
      typeof data.error === 'string' && data.error.length > 0
        ? data.error
        : VIDEO_ERROR_CODES.GenericFailed;
    throw new Error(errorCode);
  }
  return data;
}

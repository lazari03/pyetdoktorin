// src/models/100msTypes.ts
export type GenerateRoomCodeAndTokenResponse = {
  error?: string;
  token?: string;
  room_id?: string;
  roomCode?: string;
  sessionToken?: string;
  join_url?: string;
  [key: string]: unknown;
};

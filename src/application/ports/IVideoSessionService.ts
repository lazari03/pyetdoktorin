import type { GenerateRoomCodeAndTokenResponse } from '@/models/100msTypes';

export interface IVideoSessionService {
  generateRoomCodeAndToken(params: {
    user_id: string;
    room_id: string;
    role: string;
    template_id?: string;
    idToken: string;
  }): Promise<GenerateRoomCodeAndTokenResponse>;
}

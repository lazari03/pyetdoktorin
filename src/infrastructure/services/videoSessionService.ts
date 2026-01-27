import { IVideoSessionService } from '@/application/ports/IVideoSessionService';
import type { GenerateRoomCodeAndTokenResponse } from '@/models/100msTypes';
import { generateRoomCodeAndToken } from '@/infrastructure/services/100msService';

export class VideoSessionService implements IVideoSessionService {
  async generateRoomCodeAndToken(params: {
    user_id: string;
    room_id: string;
    role: string;
    template_id?: string;
  }): Promise<GenerateRoomCodeAndTokenResponse> {
    return generateRoomCodeAndToken(params);
  }
}

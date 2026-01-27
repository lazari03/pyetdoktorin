import { IVideoSessionService } from '@/application/ports/IVideoSessionService';
import type { GenerateRoomCodeAndTokenResponse } from '@/models/100msTypes';

export class GenerateRoomCodeUseCase {
  constructor(private videoSessionService: IVideoSessionService) {}

  async execute(params: {
    user_id: string;
    room_id: string;
    role: string;
    template_id?: string;
  }): Promise<GenerateRoomCodeAndTokenResponse> {
    return this.videoSessionService.generateRoomCodeAndToken(params);
  }
}

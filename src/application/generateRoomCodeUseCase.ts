import { IVideoSessionService } from '@/application/ports/IVideoSessionService';
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';
import type { GenerateRoomCodeAndTokenResponse } from '@/models/100msTypes';

export class GenerateRoomCodeUseCase {
  constructor(
    private videoSessionService: IVideoSessionService,
    private analytics?: IAnalyticsService
  ) {}

  async execute(params: {
    user_id: string;
    room_id: string;
    role: string;
    template_id?: string;
    idToken: string;
  }): Promise<GenerateRoomCodeAndTokenResponse> {
    const result = await this.videoSessionService.generateRoomCodeAndToken(params);
    
    this.analytics?.track('video_session_started', {
      roomId: params.room_id,
      role: params.role,
    });
    
    return result;
  }
}

import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';

export class CreateReciepeUseCase {
  constructor(
    private service: IReciepeService,
    private analytics?: IAnalyticsService
  ) {}
  
  async execute(payload: ReciepePayload): Promise<ReciepePayload> {
    const created = await this.service.createReciepe(payload);
    
    const meta: Record<string, string | number | boolean> = {
      patientId: payload.patientId,
    };
    if (payload.doctorId) meta.doctorId = payload.doctorId;
    if (payload.pharmacyId) meta.pharmacyId = payload.pharmacyId;
    this.analytics?.track('prescription_created', meta);
    
    return created;
  }
}

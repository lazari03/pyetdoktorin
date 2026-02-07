import { IReciepeService, ReciepePayload } from "./ports/IReciepeService";
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';

export class CreateReciepeUseCase {
  constructor(
    private service: IReciepeService,
    private analytics?: IAnalyticsService
  ) {}
  
  async execute(payload: ReciepePayload): Promise<string> {
    const id = await this.service.createReciepe(payload);
    
    this.analytics?.track('prescription_created', {
      doctorId: payload.doctorId,
      patientId: payload.patientId,
      pharmacyId: payload.pharmacyId,
    });
    
    return id;
  }
}

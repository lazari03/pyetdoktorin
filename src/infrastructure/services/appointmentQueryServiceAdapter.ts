import type { IAppointmentQueryService } from '@/application/ports/IAppointmentQueryService';
import { listAppointments } from '@/network/appointments';

export class AppointmentQueryServiceAdapter implements IAppointmentQueryService {
  async listAppointments() {
    return listAppointments();
  }
}

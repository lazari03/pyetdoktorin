import { IAppointmentRepository } from '@/domain/repositories/IAppointmentRepository';

export class CheckAppointmentExistsUseCase {
  constructor(private appointmentRepo: IAppointmentRepository) {}

  async execute(patientId: string, doctorId: string, preferredDate: string, preferredTime: string): Promise<boolean> {
    const appointments = await this.appointmentRepo.getByUser(patientId, false);
    return appointments.some(
      (a) => a.doctorId === doctorId && a.preferredDate === preferredDate && a.preferredTime === preferredTime
    );
  }
}

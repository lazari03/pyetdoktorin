import { Appointment } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';

export interface GetUserAppointmentsDTO {
  userId: string;
  isDoctor: boolean;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export class GetUserAppointmentsUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository
  ) {}

  async execute(data: GetUserAppointmentsDTO): Promise<Appointment[]> {
    const { userId, isDoctor, status, startDate, endDate } = data;

    try {
      let appointments: Appointment[];

      // Get base appointments
      if (startDate && endDate) {
        appointments = await this.appointmentRepository.findByDateRange(
          userId,
          startDate,
          endDate,
          isDoctor
        );
      } else {
        appointments = await this.appointmentRepository.getByUser(userId, isDoctor);
      }

      // Filter by status if provided
      if (status) {
        appointments = appointments.filter(
          appointment => appointment.status === status
        );
      }

      // Sort by date and time (most recent first)
      return appointments.sort((a, b) => {
        const dateA = new Date(`${a.preferredDate}T${a.preferredTime}`);
        const dateB = new Date(`${b.preferredDate}T${b.preferredTime}`);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      return [];
    }
  }

  async getUpcomingAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    const allAppointments = await this.execute({ userId, isDoctor });
    
    return allAppointments.filter(appointment => {
      const appointmentDateTime = new Date(`${appointment.preferredDate}T${appointment.preferredTime}`);
      return appointmentDateTime > new Date() && !appointment.isPast();
    });
  }

  async getPastAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    const allAppointments = await this.execute({ userId, isDoctor });
    
    return allAppointments.filter(appointment => appointment.isPast());
  }

  async getPendingAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    if (isDoctor) {
      return await this.appointmentRepository.getPendingAppointmentsForDoctor(userId);
    } else {
      return await this.appointmentRepository.getPendingAppointmentsForPatient(userId);
    }
  }

  async getConfirmedAppointments(userId: string, isDoctor: boolean): Promise<Appointment[]> {
    if (isDoctor) {
      return await this.appointmentRepository.getConfirmedAppointmentsForDoctor(userId);
    } else {
      return await this.appointmentRepository.getConfirmedAppointmentsForPatient(userId);
    }
  }
}
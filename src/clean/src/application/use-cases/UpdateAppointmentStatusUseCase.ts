import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';

export interface UpdateAppointmentStatusDTO {
  appointmentId: string;
  status: AppointmentStatus;
  userId: string; // User performing the action
}

export interface UpdateAppointmentStatusResult {
  appointment: Appointment;
  success: boolean;
  error?: string;
}

export class UpdateAppointmentStatusUseCase {
  constructor(
    private readonly appointmentRepository: IAppointmentRepository,
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(data: UpdateAppointmentStatusDTO): Promise<UpdateAppointmentStatusResult> {
    try {
      // Get existing appointment
      const existingAppointment = await this.appointmentRepository.getById(data.appointmentId);
      if (!existingAppointment) {
        return {
          appointment: null as any,
          success: false,
          error: 'Appointment not found'
        };
      }

      // Validate status transition
      const isValidTransition = this.isValidStatusTransition(existingAppointment.status, data.status);
      if (!isValidTransition) {
        return {
          appointment: null as any,
          success: false,
          error: 'Invalid status transition'
        };
      }

      // Update appointment status
      const updatedAppointment = await this.appointmentRepository.updateStatus(
        data.appointmentId,
        data.status
      );

      // Create notifications based on status change
      await this.createStatusNotification(updatedAppointment, data.status);

      return {
        appointment: updatedAppointment,
        success: true
      };
    } catch (error) {
      return {
        appointment: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update appointment status'
      };
    }
  }

  private isValidStatusTransition(
    currentStatus: AppointmentStatus,
    newStatus: AppointmentStatus
  ): boolean {
    const validTransitions: Record<AppointmentStatus, AppointmentStatus[]> = {
      [AppointmentStatus.PENDING]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.CONFIRMED]: [AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED],
      [AppointmentStatus.COMPLETED]: [], // Terminal state
      [AppointmentStatus.CANCELLED]: [], // Terminal state
      [AppointmentStatus.PAID]: [AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED]
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private async createStatusNotification(
    appointment: Appointment,
    newStatus: AppointmentStatus
  ): Promise<void> {
    let title = '';
    let message = '';
    let notifyPatient = false;
    let notifyDoctor = false;

    switch (newStatus) {
      case AppointmentStatus.CONFIRMED:
        title = 'Appointment Confirmed';
        message = `Your appointment with ${appointment.doctorName} has been confirmed`;
        notifyPatient = true;
        break;
      
      case AppointmentStatus.CANCELLED:
        title = 'Appointment Cancelled';
        message = `Appointment scheduled for ${appointment.preferredDate} at ${appointment.preferredTime} has been cancelled`;
        notifyPatient = true;
        notifyDoctor = true;
        break;
      
      case AppointmentStatus.COMPLETED:
        title = 'Appointment Completed';
        message = `Your appointment with ${appointment.doctorName} has been completed`;
        notifyPatient = true;
        break;
    }

    // This would use the CreateNotificationUseCase
    // For now, we'll skip the actual notification creation
    // await this.createNotificationForUser(appointment.patientId, title, message, 'appointment', {
    //   appointmentId: appointment.id,
    //   action: newStatus
    // });

    if (notifyDoctor) {
      // await this.createNotificationForUser(appointment.doctorId, title, message, 'appointment', {
      //   appointmentId: appointment.id,
      //   action: newStatus
      // });
    }
  }

  async confirmAppointment(appointmentId: string, userId: string): Promise<UpdateAppointmentStatusResult> {
    return await this.execute({
      appointmentId,
      status: AppointmentStatus.CONFIRMED,
      userId
    });
  }

  async cancelAppointment(appointmentId: string, userId: string): Promise<UpdateAppointmentStatusResult> {
    return await this.execute({
      appointmentId,
      status: AppointmentStatus.CANCELLED,
      userId
    });
  }

  async completeAppointment(appointmentId: string, userId: string): Promise<UpdateAppointmentStatusResult> {
    return await this.execute({
      appointmentId,
      status: AppointmentStatus.COMPLETED,
      userId
    });
  }
}
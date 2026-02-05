export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PAID = 'paid'
}

export class Appointment {
  private constructor(
    public readonly id: string,
    public readonly doctorId: string,
    public readonly doctorName: string,
    public readonly patientId: string,
    public readonly patientName: string | undefined,
    public readonly appointmentType: string,
    public readonly preferredDate: string,
    public readonly preferredTime: string,
    public readonly notes: string,
    public readonly isPaid: boolean,
    public readonly createdAt: string,
    public readonly status: AppointmentStatus,
    public readonly roomId?: string,
    public readonly roomCode?: string,
    public readonly dismissedBy?: { [userId: string]: boolean }
  ) {}

  static create(params: {
    id: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName?: string;
    appointmentType: string;
    preferredDate: string;
    preferredTime: string;
    notes: string;
    isPaid: boolean;
    createdAt: string;
    status: AppointmentStatus;
    roomId?: string;
    roomCode?: string;
    dismissedBy?: { [userId: string]: boolean };
  }): Appointment {
    return new Appointment(
      params.id,
      params.doctorId,
      params.doctorName,
      params.patientId,
      params.patientName,
      params.appointmentType,
      params.preferredDate,
      params.preferredTime,
      params.notes,
      params.isPaid,
      params.createdAt,
      params.status,
      params.roomId,
      params.roomCode,
      params.dismissedBy
    );
  }

  isPast(): boolean {
    const appointmentDateTime = new Date(`${this.preferredDate}T${this.preferredTime}`);
    const appointmentEndTime = new Date(appointmentDateTime.getTime() + 30 * 60000);
    return appointmentEndTime < new Date();
  }

  canBePaid(): boolean {
    return !this.isPaid && this.status !== AppointmentStatus.CANCELLED;
  }

  canBeCancelled(): boolean {
    return !this.isPast() && this.status !== AppointmentStatus.COMPLETED && this.status !== AppointmentStatus.CANCELLED;
  }

  isConfirmed(): boolean {
    return this.status === AppointmentStatus.CONFIRMED;
  }

  isPending(): boolean {
    return this.status === AppointmentStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === AppointmentStatus.COMPLETED;
  }

  isCancelled(): boolean {
    return this.status === AppointmentStatus.CANCELLED;
  }

  dismissForUser(userId: string): Appointment {
    const dismissedBy = { ...this.dismissedBy };
    dismissedBy![userId] = true;
    
    return Appointment.create({
      ...this,
      dismissedBy
    });
  }

  isDismissedForUser(userId: string): boolean {
    return this.dismissedBy?.[userId] ?? false;
  }

  markAsPaid(): Appointment {
    return Appointment.create({
      ...this,
      isPaid: true,
      status: AppointmentStatus.PAID
    });
  }

  confirm(): Appointment {
    return Appointment.create({
      ...this,
      status: AppointmentStatus.CONFIRMED
    });
  }

  cancel(): Appointment {
    return Appointment.create({
      ...this,
      status: AppointmentStatus.CANCELLED
    });
  }

  complete(): Appointment {
    return Appointment.create({
      ...this,
      status: AppointmentStatus.COMPLETED
    });
  }
}
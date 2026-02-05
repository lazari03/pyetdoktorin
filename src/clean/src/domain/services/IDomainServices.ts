// Domain service interfaces for complex business operations

export interface IAppointmentDomainService {
  // Business rules validation
  canBookAppointment(doctorId: string, patientId: string, date: string, time: string): Promise<boolean>;
  isTimeSlotAvailable(doctorId: string, date: string, time: string): Promise<boolean>;
  canUserAccessAppointment(userId: string, appointmentId: string): Promise<boolean>;

  // Appointment lifecycle management
  processAppointmentCreation(appointmentData: any): Promise<void>;
  processAppointmentCancellation(appointmentId: string): Promise<void>;
  processAppointmentCompletion(appointmentId: string): Promise<void>;

  // Conflict resolution
  resolveConflictingAppointments(appointments: any[]): Promise<any[]>;
}

export interface IPaymentDomainService {
  // Payment processing rules
  calculateAppointmentFee(doctorId: string, appointmentType: string): Promise<number>;
  canProcessPayment(userId: string, appointmentId: string): Promise<boolean>;
  isPaymentRefundable(paymentId: string): Promise<boolean>;

  // Payment validation
  validatePaymentAmount(amount: number, appointmentId: string): Promise<boolean>;
  validatePaymentMethod(method: string, userId: string): Promise<boolean>;
}

export interface INotificationDomainService {
  // Notification rules
  shouldSendNotification(userId: string, type: string, data: any): Promise<boolean>;
  generateNotificationContent(type: string, data: any): Promise<{ title: string; message: string }>;
  
  // Notification preferences
  getUserNotificationPreferences(userId: string): Promise<any>;
  isNotificationChannelEnabled(userId: string, channel: string): Promise<boolean>;
}

export interface IVideoSessionDomainService {
  // Video session management
  generateRoomCode(appointmentId: string): Promise<string>;
  canStartVideoSession(userId: string, appointmentId: string): Promise<boolean>;
  isValidRoomCode(roomCode: string): Promise<boolean>;
  
  // Session lifecycle
  createVideoSession(appointmentId: string): Promise<string>;
  terminateVideoSession(roomCode: string): Promise<void>;
  getActiveSessionForAppointment(appointmentId: string): Promise<string | null>;
}
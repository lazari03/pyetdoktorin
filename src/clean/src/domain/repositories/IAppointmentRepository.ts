import { Appointment, AppointmentStatus } from '../entities/Appointment';

export interface IAppointmentRepository {
  // Basic CRUD operations
  getById(id: string): Promise<Appointment | null>;
  create(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
  update(id: string, updates: Partial<Appointment>): Promise<Appointment>;
  delete(id: string): Promise<void>;

  // User-specific queries
  getByUser(userId: string, isDoctor: boolean): Promise<Appointment[]>;
  getPendingAppointmentsForDoctor(doctorId: string): Promise<Appointment[]>;
  getConfirmedAppointmentsForDoctor(doctorId: string): Promise<Appointment[]>;
  getPendingAppointmentsForPatient(patientId: string): Promise<Appointment[]>;
  getConfirmedAppointmentsForPatient(patientId: string): Promise<Appointment[]>;

  // Status-specific operations
  updateStatus(id: string, status: AppointmentStatus): Promise<Appointment>;
  markAsPaid(id: string): Promise<Appointment>;
  
  // Search and filtering
  findByDateRange(userId: string, startDate: string, endDate: string, isDoctor: boolean): Promise<Appointment[]>;
  findByStatus(status: AppointmentStatus): Promise<Appointment[]>;
  
  // Real-time subscriptions (if needed)
  subscribeToUserAppointments(
    userId: string, 
    isDoctor: boolean, 
    callback: (appointments: Appointment[]) => void
  ): () => void;

  // Batch operations
  updateMultiple(updates: { id: string; changes: Partial<Appointment> }[]): Promise<Appointment[]>;
}
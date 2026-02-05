import { Doctor } from '../entities/Doctor';

export interface IDoctorRepository {
  // Basic CRUD operations
  getById(id: string): Promise<Doctor | null>;
  getByUserId(userId: string): Promise<Doctor | null>;
  create(doctor: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor>;
  update(id: string, updates: Partial<Doctor>): Promise<Doctor>;
  delete(id: string): Promise<void>;

  // Search and filtering
  getBySpecialization(specialization: string): Promise<Doctor[]>;
  getApprovedDoctors(): Promise<Doctor[]>;
  getPendingDoctors(): Promise<Doctor[]>;
  searchDoctors(query: string): Promise<Doctor[]>;
  
  // Rating and stats
  getTopDoctorsByAppointments(limit: number): Promise<Doctor[]>;
  getTopDoctorsByRating(limit: number): Promise<Doctor[]>;
  updateRating(doctorId: string, newRating: number, totalRatings: number): Promise<Doctor>;
  incrementAppointments(doctorId: string): Promise<Doctor>;
  
  // Clinic and location based
  getDoctorsByClinic(clinic: string): Promise<Doctor[]>;
  
  // Batch operations
  updateMultiple(updates: { id: string; changes: Partial<Doctor> }[]): Promise<Doctor[]>;
  
  // Admin operations
  approveDoctor(doctorId: string): Promise<Doctor>;
  getAllDoctors(limit?: number, offset?: number): Promise<Doctor[]>;
  getDoctorStats(): Promise<{
    total: number;
    approved: number;
    pending: number;
    averageRating: number;
  }>;
}
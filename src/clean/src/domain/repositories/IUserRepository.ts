import { User, UserRole, UserProfile, DoctorProfile } from '../entities/User';

export interface IUserRepository {
  // Basic CRUD operations
  getById(id: string): Promise<User | null>;
  getByEmail(email: string): Promise<User | null>;
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
  update(id: string, updates: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;

  // Role-specific queries
  getUsersByRole(role: UserRole): Promise<User[]>;
  getDoctors(): Promise<User[]>;
  getPatients(): Promise<User[]>;
  getAdmins(): Promise<User[]>;

  // Profile operations
  updateProfile(userId: string, profile: Partial<UserProfile | DoctorProfile>): Promise<User>;
  approveDoctor(userId: string): Promise<User>;
  
  // Search and filtering
  searchByName(name: string, role?: UserRole): Promise<User[]>;
  getIncompleteProfiles(): Promise<User[]>;
  
  // Authentication related
  getUserWithProfile(userId: string): Promise<User | null>;
  
  // Batch operations
  updateMultiple(updates: { id: string; changes: Partial<User> }[]): Promise<User[]>;
  
  // Admin operations
  getAllUsers(limit?: number, offset?: number): Promise<User[]>;
  getUserStats(): Promise<{
    total: number;
    doctors: number;
    patients: number;
    admins: number;
  }>;
}
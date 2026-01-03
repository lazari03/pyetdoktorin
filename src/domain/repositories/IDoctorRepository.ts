import { Doctor } from '../entities/Doctor';

export interface IDoctorRepository {
  getById(id: string): Promise<Doctor | null>;
  getByName(name: string): Promise<Doctor[]>;
  getBySpecialization(specialization: string): Promise<Doctor[]>;
  getAll(): Promise<Doctor[]>;
  create(payload: Partial<Doctor>): Promise<Doctor>;
  update(id: string, updates: Partial<Doctor>): Promise<Doctor>;
  delete(id: string): Promise<void>;
}

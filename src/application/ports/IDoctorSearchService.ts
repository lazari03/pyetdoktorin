import { Doctor } from '@/domain/entities/Doctor';
import { SearchType } from '@/models/FirestoreConstants';

export interface IDoctorSearchService {
  fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]>;
}

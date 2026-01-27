import { IDoctorSearchService } from '@/application/ports/IDoctorSearchService';
import { Doctor } from '@/domain/entities/Doctor';
import { SearchType } from '@/models/FirestoreConstants';
import { fetchDoctors } from '@/infrastructure/services/doctorService';

export class DoctorSearchService implements IDoctorSearchService {
  async fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
    return fetchDoctors(searchTerm, searchType);
  }
}

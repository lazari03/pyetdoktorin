import { IDoctorSearchService } from '@/application/ports/IDoctorSearchService';
import { Doctor } from '@/domain/entities/Doctor';
import { SearchType } from '@/models/FirestoreConstants';

export class FetchDoctorsUseCase {
  constructor(private doctorSearchService: IDoctorSearchService) {}

  async execute(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
    return this.doctorSearchService.fetchDoctors(searchTerm, searchType);
  }
}

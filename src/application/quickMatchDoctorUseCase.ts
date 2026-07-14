import { addDays, formatISO } from 'date-fns';
import { SearchType } from '@/models/FirestoreConstants';
import type { Doctor } from '@/domain/entities/Doctor';
import type { IDoctorSearchService } from './ports/IDoctorSearchService';
import type { IAvailabilityService } from './ports/IAvailabilityService';
import {
  rankDoctorMatches,
  type DoctorMatch,
  type DoctorSlotCandidate,
} from '@/domain/rules/quickMatchRules';

// ponytail: availability is fetched per doctor, so we cap candidates at 10;
// move matching into a single backend endpoint if the doctor roster outgrows this
const MAX_CANDIDATES = 10;
// how many days forward to look, per doctor, before giving up on "no matter when"
const MAX_DAYS_AHEAD = 14;

export class QuickMatchDoctorUseCase {
  constructor(
    private doctorSearch: IDoctorSearchService,
    private availability: IAvailabilityService,
  ) {}

  async execute(specialty: string, date: string, preferredTime: string): Promise<DoctorMatch[]> {
    const doctors = await this.doctorSearch.fetchDoctors(specialty, SearchType.Specializations);
    const candidates = await Promise.all(
      doctors.slice(0, MAX_CANDIDATES).map((doctor) => this.findEarliestSlots(doctor, date)),
    );
    const found = candidates.filter((c): c is DoctorSlotCandidate => c !== null);
    return rankDoctorMatches(found, preferredTime, date);
  }

  private async findEarliestSlots(
    doctor: Doctor,
    requestedDate: string,
  ): Promise<DoctorSlotCandidate | null> {
    for (let offset = 0; offset <= MAX_DAYS_AHEAD; offset++) {
      const day = formatISO(addDays(new Date(`${requestedDate}T00:00:00`), offset), {
        representation: 'date',
      });
      const slots = await this.availability.getResolvedSlots(doctor.id, day).catch(() => []);
      const free = slots.filter((slot) => !slot.booked && !slot.past);
      if (free.length > 0) return { doctor, date: day, slots };
    }
    return null;
  }
}

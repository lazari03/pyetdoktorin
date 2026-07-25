import type {
  DoctorAgreementStatus,
  DoctorTerms,
  IDoctorAgreementService,
} from '@/application/ports/IDoctorAgreementService';
import { backendFetch } from '@/network/backendClient';

export class DoctorAgreementService implements IDoctorAgreementService {
  async getTerms(): Promise<DoctorTerms> {
    return backendFetch<DoctorTerms>('/api/doctor-agreements/terms');
  }

  async getMine(): Promise<DoctorAgreementStatus> {
    return backendFetch<DoctorAgreementStatus>('/api/doctor-agreements/me');
  }

  async submit(signatureDataUrl: string): Promise<DoctorAgreementStatus> {
    return backendFetch<DoctorAgreementStatus>('/api/doctor-agreements', {
      method: 'POST',
      body: JSON.stringify({ signatureDataUrl }),
    });
  }
}

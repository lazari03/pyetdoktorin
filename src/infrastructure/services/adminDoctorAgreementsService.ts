import type {
  DoctorAgreementSummary,
  IAdminDoctorAgreementsService,
} from '@/application/ports/IAdminDoctorAgreementsService';
import { backendFetch, backendFetchBlob } from '@/network/backendClient';

export class AdminDoctorAgreementsService implements IAdminDoctorAgreementsService {
  async list(): Promise<DoctorAgreementSummary[]> {
    const result = await backendFetch<{ items: DoctorAgreementSummary[] }>('/api/doctor-agreements');
    return result.items;
  }

  async downloadPdf(doctorId: string): Promise<Blob> {
    return backendFetchBlob(`/api/doctor-agreements/${doctorId}/pdf`);
  }
}

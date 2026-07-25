import type { IPlatformTermsService, PlatformTerms } from '@/application/ports/IPlatformTermsService';
import { backendFetch } from '@/network/backendClient';

export class PlatformTermsService implements IPlatformTermsService {
  async getTerms(): Promise<PlatformTerms> {
    return backendFetch<PlatformTerms>('/api/platform-terms');
  }
}

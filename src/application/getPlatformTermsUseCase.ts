import type { IPlatformTermsService, PlatformTerms } from '@/application/ports/IPlatformTermsService';

export class GetPlatformTermsUseCase {
  constructor(private platformTermsService: IPlatformTermsService) {}

  async execute(): Promise<PlatformTerms> {
    return this.platformTermsService.getTerms();
  }
}

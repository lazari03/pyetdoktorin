import type { FamilyMember, IFamilyService } from '@/application/ports/IFamilyService';

export class ListFamilyInvitesUseCase {
  constructor(private familyService: IFamilyService) {}

  async execute(): Promise<FamilyMember[]> {
    return this.familyService.listInvites();
  }
}

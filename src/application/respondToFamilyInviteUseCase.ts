import type { FamilyMember, IFamilyService } from '@/application/ports/IFamilyService';

export class RespondToFamilyInviteUseCase {
  constructor(private familyService: IFamilyService) {}

  async execute(id: string, accept: boolean): Promise<FamilyMember> {
    return this.familyService.respondToInvite(id, accept);
  }
}

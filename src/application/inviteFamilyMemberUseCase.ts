import type { FamilyMember, IFamilyService } from '@/application/ports/IFamilyService';

export class InviteFamilyMemberUseCase {
  constructor(private familyService: IFamilyService) {}

  async execute(email: string, relationship: string): Promise<FamilyMember> {
    return this.familyService.inviteExistingUser(email, relationship);
  }
}

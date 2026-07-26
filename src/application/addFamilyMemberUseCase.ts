import type { AddFamilyMemberInput, FamilyMember, IFamilyService } from '@/application/ports/IFamilyService';

export class AddFamilyMemberUseCase {
  constructor(private familyService: IFamilyService) {}

  async execute(input: AddFamilyMemberInput): Promise<FamilyMember> {
    return this.familyService.addMember(input);
  }
}

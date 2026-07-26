import type { IFamilyService } from '@/application/ports/IFamilyService';

export class RemoveFamilyMemberUseCase {
  constructor(private familyService: IFamilyService) {}

  async execute(id: string): Promise<void> {
    return this.familyService.removeMember(id);
  }
}

import type {
  AddFamilyMemberInput,
  FamilyMember,
  IFamilyService,
} from '@/application/ports/IFamilyService';
import { backendFetch } from '@/network/backendClient';

export class FamilyService implements IFamilyService {
  async listMine(): Promise<FamilyMember[]> {
    const result = await backendFetch<{ items: FamilyMember[] }>('/api/family');
    return result.items;
  }

  async listInvites(): Promise<FamilyMember[]> {
    const result = await backendFetch<{ items: FamilyMember[] }>('/api/family/invites');
    return result.items;
  }

  async addMember(input: AddFamilyMemberInput): Promise<FamilyMember> {
    const result = await backendFetch<{ member: FamilyMember }>('/api/family', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return result.member;
  }

  async inviteExistingUser(email: string, relationship: string): Promise<FamilyMember> {
    const result = await backendFetch<{ member: FamilyMember }>('/api/family', {
      method: 'POST',
      body: JSON.stringify({ email, relationship }),
    });
    return result.member;
  }

  async respondToInvite(id: string, accept: boolean): Promise<FamilyMember> {
    const result = await backendFetch<{ member: FamilyMember }>(`/api/family/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ accept }),
    });
    return result.member;
  }

  async removeMember(id: string): Promise<void> {
    await backendFetch(`/api/family/${id}`, { method: 'DELETE' });
  }
}

export type FamilyMemberStatus = 'confirmed' | 'invited' | 'declined';

export interface FamilyMember {
  id: string;
  ownerUserId: string;
  linkedUserId?: string;
  name: string;
  surname?: string;
  relationship: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  status: FamilyMemberStatus;
  invitedEmail?: string;
  createdAt: number;
}

export interface AddFamilyMemberInput {
  name: string;
  surname?: string;
  relationship: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

export interface IFamilyService {
  listMine(): Promise<FamilyMember[]>;
  listInvites(): Promise<FamilyMember[]>;
  addMember(input: AddFamilyMemberInput): Promise<FamilyMember>;
  inviteExistingUser(email: string, relationship: string): Promise<FamilyMember>;
  respondToInvite(id: string, accept: boolean): Promise<FamilyMember>;
  removeMember(id: string): Promise<void>;
}

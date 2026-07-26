import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { createUserNotification } from '@/services/userNotificationsService';
import { FamilyMemberForbiddenError, FamilyMemberNotFoundError } from '@/errors/familyErrors';

const COLLECTION = 'familyMembers';

export type FamilyMemberStatus = 'confirmed' | 'invited' | 'declined';

export interface FamilyMember {
  id: string;
  ownerUserId: string;
  linkedUserId?: string | undefined;
  name: string;
  surname?: string | undefined;
  relationship: string;
  dateOfBirth?: string | undefined;
  phoneNumber?: string | undefined;
  status: FamilyMemberStatus;
  invitedEmail?: string | undefined;
  createdAt: number;
}

function mapDoc(doc: FirebaseFirestore.QueryDocumentSnapshot | FirebaseFirestore.DocumentSnapshot): FamilyMember {
  const data = doc.data() as Omit<FamilyMember, 'id'>;
  return { id: doc.id, ...data };
}

// ponytail: sorted in-memory rather than a compound (ownerUserId ==, createdAt
// orderBy) query — family lists are small, no need for a composite index.
export async function listMyFamilyMembers(ownerUserId: string): Promise<FamilyMember[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db.collection(COLLECTION).where('ownerUserId', '==', ownerUserId).get();
  return snap.docs.map(mapDoc).sort((a, b) => b.createdAt - a.createdAt);
}

export async function listPendingInvites(uid: string): Promise<FamilyMember[]> {
  const db = getFirebaseAdmin().firestore();
  const snap = await db
    .collection(COLLECTION)
    .where('linkedUserId', '==', uid)
    .where('status', '==', 'invited')
    .get();
  return snap.docs.map(mapDoc).sort((a, b) => b.createdAt - a.createdAt);
}

export async function getFamilyMember(id: string): Promise<FamilyMember | null> {
  const db = getFirebaseAdmin().firestore();
  const doc = await db.collection(COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return mapDoc(doc);
}

export async function addFamilyMember(
  ownerUserId: string,
  input: {
    name: string;
    surname?: string | undefined;
    relationship: string;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
  },
): Promise<FamilyMember> {
  const db = getFirebaseAdmin().firestore();
  const doc = {
    ownerUserId,
    ...input,
    status: 'confirmed' as const,
    createdAt: Date.now(),
  };
  const ref = await db.collection(COLLECTION).add(doc);
  return { id: ref.id, ...doc };
}

export async function inviteExistingUser(
  ownerUserId: string,
  email: string,
  relationship: string,
): Promise<FamilyMember> {
  const db = getFirebaseAdmin().firestore();
  const usersSnap = await db.collection('users').where('email', '==', email).limit(1).get();
  if (usersSnap.empty) {
    throw new FamilyMemberNotFoundError('No platform user found with that email');
  }
  const userDoc = usersSnap.docs[0]!;
  const userData = userDoc.data();
  const doc = {
    ownerUserId,
    linkedUserId: userDoc.id,
    name: [userData.name, userData.surname].filter(Boolean).join(' ').trim() || email,
    relationship,
    status: 'invited' as const,
    invitedEmail: email,
    createdAt: Date.now(),
  };
  const ref = await db.collection(COLLECTION).add(doc);

  await createUserNotification({
    userId: userDoc.id,
    type: 'family_invite',
    title: 'Family invitation',
    body: `You've been invited to join a family group as "${relationship}". You can accept or decline from your profile settings.`,
    metadata: { familyMemberId: ref.id },
  });

  return { id: ref.id, ...doc };
}

export async function respondToInvite(id: string, uid: string, accept: boolean): Promise<FamilyMember> {
  const db = getFirebaseAdmin().firestore();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    throw new FamilyMemberNotFoundError();
  }
  const member = mapDoc(existing);
  if (member.linkedUserId !== uid) {
    throw new FamilyMemberForbiddenError();
  }
  const status: FamilyMemberStatus = accept ? 'confirmed' : 'declined';
  await ref.update({ status });

  await createUserNotification({
    userId: member.ownerUserId,
    type: 'family_invite_response',
    title: accept ? 'Family invitation accepted' : 'Family invitation declined',
    body: `${member.name} has ${accept ? 'accepted' : 'declined'} your family invitation.`,
    metadata: { familyMemberId: id },
  });

  return { ...member, status };
}

export async function updateFamilyMember(
  id: string,
  ownerUserId: string,
  updates: {
    name?: string | undefined;
    surname?: string | undefined;
    relationship?: string | undefined;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
  },
): Promise<FamilyMember> {
  const db = getFirebaseAdmin().firestore();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    throw new FamilyMemberNotFoundError();
  }
  const member = mapDoc(existing);
  if (member.ownerUserId !== ownerUserId) {
    throw new FamilyMemberForbiddenError();
  }
  if (member.linkedUserId) {
    // Can't edit a linked platform user's own profile info on their behalf.
    throw new FamilyMemberForbiddenError('Cannot edit a linked family member\'s profile');
  }
  await ref.update(updates);
  return {
    ...member,
    name: updates.name ?? member.name,
    relationship: updates.relationship ?? member.relationship,
    surname: updates.surname ?? member.surname,
    dateOfBirth: updates.dateOfBirth ?? member.dateOfBirth,
    phoneNumber: updates.phoneNumber ?? member.phoneNumber,
  };
}

export async function removeFamilyMember(id: string, uid: string): Promise<void> {
  const db = getFirebaseAdmin().firestore();
  const ref = db.collection(COLLECTION).doc(id);
  const existing = await ref.get();
  if (!existing.exists) {
    throw new FamilyMemberNotFoundError();
  }
  const member = mapDoc(existing);
  if (member.ownerUserId !== uid && member.linkedUserId !== uid) {
    throw new FamilyMemberForbiddenError();
  }
  await ref.delete();
}

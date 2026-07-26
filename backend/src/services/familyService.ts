import { getFirebaseAdmin } from '@/config/firebaseAdmin';
import { UserRole } from '@/domain/entities/UserRole';
import { createUserNotification } from '@/services/userNotificationsService';
import { sendPlatformEmail } from '@/services/emailService';
import {
  FamilyMemberForbiddenError,
  FamilyMemberInvalidRoleError,
  FamilyMemberNotFoundError,
} from '@/errors/familyErrors';

const COLLECTION = 'familyMembers';

export type FamilyMemberStatus = 'confirmed' | 'invited' | 'declined';

export interface FamilyMember {
  id: string;
  ownerUserId: string;
  ownerName?: string | undefined;
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

// ponytail: sorted/merged in-memory rather than compound Firestore queries —
// family lists are small enough that this avoids needing composite indexes.
export async function listMyFamilyMembers(uid: string): Promise<FamilyMember[]> {
  const db = getFirebaseAdmin().firestore();
  const [ownedSnap, memberOfSnap] = await Promise.all([
    db.collection(COLLECTION).where('ownerUserId', '==', uid).get(),
    db.collection(COLLECTION).where('linkedUserId', '==', uid).where('status', '==', 'confirmed').get(),
  ]);
  const byId = new Map<string, FamilyMember>();
  for (const doc of [...ownedSnap.docs, ...memberOfSnap.docs]) {
    byId.set(doc.id, mapDoc(doc));
  }
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
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

/**
 * Single entry point for adding a family member: looks the email up against
 * existing accounts and branches accordingly —
 *  - an existing Patient account is sent an in-app invite to accept/decline;
 *  - an existing non-Patient account (e.g. a doctor) is rejected outright,
 *    since a family member must be a patient;
 *  - no matching account creates one (Patient role) on the spot and emails
 *    the new owner a password-setup link, since there's no one to "invite".
 */
export async function addOrCreateFamilyMember(
  ownerUserId: string,
  ownerName: string,
  input: {
    name: string;
    surname?: string | undefined;
    email: string;
    relationship: string;
    dateOfBirth?: string | undefined;
    phoneNumber?: string | undefined;
  },
): Promise<FamilyMember> {
  const db = getFirebaseAdmin().firestore();
  const usersSnap = await db.collection('users').where('email', '==', input.email).limit(1).get();

  if (!usersSnap.empty) {
    const userDoc = usersSnap.docs[0]!;
    const userData = userDoc.data();
    const existingRole = String(userData.role ?? '');
    if (existingRole !== UserRole.Patient) {
      throw new FamilyMemberInvalidRoleError();
    }
    const doc = {
      ownerUserId,
      ownerName,
      linkedUserId: userDoc.id,
      name: [userData.name, userData.surname].filter(Boolean).join(' ').trim() || input.name,
      relationship: input.relationship,
      status: 'invited' as const,
      invitedEmail: input.email,
      createdAt: Date.now(),
    };
    const ref = await db.collection(COLLECTION).add(doc);

    await createUserNotification({
      userId: userDoc.id,
      type: 'family_invite',
      title: 'Family invitation',
      body: `${ownerName} invited you to join their family group as "${input.relationship}". You can accept or decline from your profile settings.`,
      metadata: { familyMemberId: ref.id },
    });

    return { id: ref.id, ...doc };
  }

  // No existing account — create one on the new member's behalf.
  const admin = getFirebaseAdmin();
  const displayName = [input.name, input.surname].filter(Boolean).join(' ').trim() || input.name;
  const userRecord = await admin.auth().createUser({
    email: input.email,
    displayName,
  });
  await admin.auth().setCustomUserClaims(userRecord.uid, { role: UserRole.Patient, admin: false });
  await db.collection('users').doc(userRecord.uid).set({
    name: input.name,
    surname: input.surname ?? '',
    role: UserRole.Patient,
    email: input.email,
    phone: input.phoneNumber ?? null,
    phoneNumber: input.phoneNumber ?? null,
    createdBy: 'family_invite',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }, { merge: true });

  const doc = {
    ownerUserId,
    ownerName,
    linkedUserId: userRecord.uid,
    name: input.name,
    ...(input.surname !== undefined ? { surname: input.surname } : {}),
    relationship: input.relationship,
    ...(input.dateOfBirth !== undefined ? { dateOfBirth: input.dateOfBirth } : {}),
    ...(input.phoneNumber !== undefined ? { phoneNumber: input.phoneNumber } : {}),
    status: 'confirmed' as const,
    invitedEmail: input.email,
    createdAt: Date.now(),
  };
  const ref = await db.collection(COLLECTION).add(doc);

  try {
    const resetLink = await admin.auth().generatePasswordResetLink(input.email);
    await sendPlatformEmail({
      to: input.email,
      subject: 'Your Pyet Doktorin account has been created',
      text: `Hi ${input.name},\n\n${ownerName} added you to their family group on Pyet Doktorin, so we've created an account for you (${input.email}).\n\nSet your password to log in: ${resetLink}\n\nOnce logged in, ${ownerName} will be able to book and pay for appointments on your behalf.`,
    });
  } catch (error) {
    console.error('Failed to send family account-created email:', error);
  }

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
  if (member.linkedUserId && (updates.name || updates.surname)) {
    // Can't edit a linked platform user's own name/surname on their behalf —
    // that's their profile, not the family relationship label.
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

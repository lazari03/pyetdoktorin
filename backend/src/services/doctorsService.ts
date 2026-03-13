import { getFirebaseAdmin } from '@/config/firebaseAdmin';

export type DoctorSearchType = 'name' | 'specializations';

export type PublicDoctorProfile = {
  id: string;
  name: string;
  specialization: string[];
  profilePicture?: string;
  bio?: string;
};

function normalizeSpecializations(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.specializations)) {
    return data.specializations.filter((value): value is string => typeof value === 'string' && value.trim().length > 0);
  }
  if (typeof data.specialization === 'string' && data.specialization.trim().length > 0) {
    return [data.specialization];
  }
  return [];
}

function mapDoctorDoc(id: string, data: Record<string, unknown>): PublicDoctorProfile | null {
  const role = typeof data.role === 'string' ? data.role.toLowerCase() : '';
  if (role !== 'doctor') {
    return null;
  }
  const approvalStatus = typeof data.approvalStatus === 'string' ? data.approvalStatus.toLowerCase() : undefined;
  if (approvalStatus && approvalStatus !== 'approved') {
    return null;
  }

  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!name) {
    return null;
  }

  const profile: PublicDoctorProfile = {
    id,
    name,
    specialization: normalizeSpecializations(data),
  };

  if (typeof data.profilePicture === 'string' && data.profilePicture.trim().length > 0) {
    profile.profilePicture = data.profilePicture;
  }
  if (typeof data.bio === 'string' && data.bio.trim().length > 0) {
    profile.bio = data.bio;
  }

  return profile;
}

export async function searchDoctors(searchTerm: string, searchType: DoctorSearchType): Promise<PublicDoctorProfile[]> {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  if (!normalizedSearch) {
    return [];
  }

  const admin = getFirebaseAdmin();
  const snapshot = await admin
    .firestore()
    .collection('users')
    .where('role', '==', 'doctor')
    .get();

  const doctors = snapshot.docs
    .map((doc) => mapDoctorDoc(doc.id, doc.data() as Record<string, unknown>))
    .filter((doctor): doctor is PublicDoctorProfile => Boolean(doctor));

  if (searchType === 'specializations') {
    return doctors.filter((doctor) =>
      doctor.specialization.some((specialization) => specialization.toLowerCase().includes(normalizedSearch)),
    );
  }

  return doctors.filter((doctor) => doctor.name.toLowerCase().includes(normalizedSearch));
}

export async function getDoctorById(id: string): Promise<PublicDoctorProfile | null> {
  const admin = getFirebaseAdmin();
  const snapshot = await admin.firestore().collection('users').doc(id).get();
  if (!snapshot.exists) {
    return null;
  }
  return mapDoctorDoc(snapshot.id, snapshot.data() as Record<string, unknown>);
}

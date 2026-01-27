import { doc, getDoc } from "firebase/firestore";
export async function getDoctorById(doctorId: string): Promise<Doctor | null> {
  try {
    const doctorRef = doc(db, FirestoreCollections.Users, doctorId);
    const snapshot = await getDoc(doctorRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    if (data[DoctorFields.Role] !== DoctorFields.RoleDoctor) return null;
    // Hide non-approved doctor profiles from patient view
    if (data.approvalStatus && data.approvalStatus !== 'approved') return null;
    return {
      id: doctorId,
      name: data[DoctorFields.Name] || "",
      specialization: Array.isArray(data[DoctorFields.Specializations]) ? data[DoctorFields.Specializations] : [],
      profilePicture: data.profilePicture || undefined,
    };
  } catch {
    return null;
  }
}
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";
import { Doctor } from "@/domain/entities/Doctor";
import { FirestoreCollections, DoctorFields, SearchType } from "@/models/FirestoreConstants";
import { hasSpecialization, isProfileComplete } from "@/domain/rules/doctorRules";

export async function fetchDoctors(searchTerm: string, searchType: SearchType): Promise<Doctor[]> {
  try {
    const doctorsCollection = collection(db, FirestoreCollections.Users);
    if (!searchTerm.trim()) {
      return [];
    }
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const doctorQuery = query(
      doctorsCollection,
      where(DoctorFields.Role, "==", DoctorFields.RoleDoctor)
    );
    const snapshot = await getDocs(doctorQuery);
    if (snapshot.empty) {
      return [];
    }
    const doctors = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data[DoctorFields.Name] || "",
        specialization: Array.isArray(data[DoctorFields.Specializations]) ? data[DoctorFields.Specializations] : [],
        profilePicture: data.profilePicture || undefined,
      } as Doctor;
    });
    let filtered: Doctor[] = [];
    if (searchType === SearchType.Name) {
      filtered = doctors.filter((doctor) =>
        doctor.name && doctor.name.toLowerCase().includes(normalizedSearchTerm)
      );
    } else if (searchType === SearchType.Specializations) {
      filtered = doctors.filter((doctor) => hasSpecialization(doctor, normalizedSearchTerm));
    } else {
      filtered = doctors;
    }
    // Only return doctors with complete profiles and approved status
    const complete = filtered.filter(isProfileComplete);
    const approvedOnly = complete.filter((doctor) => {
      const d = snapshot.docs.find((s) => s.id === doctor.id)?.data();
      const status = d?.approvalStatus as 'pending' | 'approved' | undefined;
      return status === 'approved' || status === undefined; // default to showing if field missing for legacy
    });
    return approvedOnly;
  } catch {
    throw new Error("Failed to fetch doctors");
  }
}

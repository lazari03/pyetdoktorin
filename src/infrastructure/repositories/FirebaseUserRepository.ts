import { UserRole } from '../../domain/entities/UserRole';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebaseconfig';

export class FirebaseUserRepository implements IUserRepository {
  async getById(id: string): Promise<{ id: string; role: UserRole; name?: string; specialization?: string[]; profilePicture?: string } | null> {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const data = userSnap.data();
    // Return all doctor profile fields if present
    return {
      id,
      role: data.role,
      name: data.name,
      specialization: data.specialization ?? [],
      profilePicture: data.profilePicture ?? '',
      // Add other fields as needed
    };
  }

  async getByRole(_role: UserRole): Promise<Array<{ id: string; role: UserRole }>> {
    // Implement as needed
    return [];
  }

  async create(_payload: { id: string; role: UserRole }): Promise<void> {
    // Implement as needed
  }

  async update(_id: string, _updates: Partial<{ role: UserRole }>): Promise<void> {
    // Implement as needed
  }

  async delete(_id: string): Promise<void> {
    // Implement as needed
  }

  async authenticate(_email: string, _password: string): Promise<{ id: string; role: UserRole } | null> {
    // Implement as needed
    return null;
  }

  async isProfileIncomplete(role: UserRole, userId: string): Promise<boolean> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return true;
    const userData = userSnap.data();
    switch (role) {
      case UserRole.Doctor:
        return ['name', 'surname', 'phoneNumber', 'about', 'specializations'].some(
          (field) => !userData[field]
        );
      case UserRole.Patient:
        return ['name', 'surname', 'phoneNumber', 'email'].some(
          (field) => !userData[field]
        );
      default:
        return true;
    }
  }
}

import { User, UserRole, UserProfile, DoctorProfile } from '../../../domain/entities/User';
import { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class FirebaseUserRepository implements IUserRepository {
  private readonly collectionName = 'users';

  async getById(id: string): Promise<User | null> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const userRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(userRef);
      
      if (!snapshot.exists()) return null;
      
      const data = snapshot.data();
      return User.create({
        id: snapshot.id,
        email: data.email,
        role: data.role,
        profile: data.profile,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      throw error;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return User.create({
        id: doc.id,
        email: data.email,
        role: data.role,
        profile: data.profile,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      const docRef = await addDoc(usersRef, {
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const createdUser = await this.getById(docRef.id);
      if (!createdUser) {
        throw new Error('Failed to create user');
      }

      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    try {
      const { getFirestore, doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();
      const userRef = doc(db, this.collectionName, id);
      
      const updateData: any = {};
      if (updates.email !== undefined) updateData.email = updates.email;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.profile !== undefined) updateData.profile = updates.profile;
      
      updateData.updatedAt = serverTimestamp();

      await updateDoc(userRef, updateData);

      const updatedUser = await this.getById(id);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore();
      const userRef = doc(db, this.collectionName, id);
      await deleteDoc(userRef);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      const q = query(usersRef, where('role', '==', role));
      const snapshot = await getDocs(q);
      
      return this.mapSnapshotToUsers(snapshot);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  async getDoctors(): Promise<User[]> {
    return await this.getUsersByRole(UserRole.DOCTOR);
  }

  async getPatients(): Promise<User[]> {
    return await this.getUsersByRole(UserRole.PATIENT);
  }

  async getAdmins(): Promise<User[]> {
    return await this.getUsersByRole(UserRole.ADMIN);
  }

  async updateProfile(userId: string, profile: Partial<UserProfile | DoctorProfile>): Promise<User> {
    return await this.update(userId, { profile });
  }

  async approveDoctor(userId: string): Promise<User> {
    const user = await this.getById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isDoctor()) {
      throw new Error('User is not a doctor');
    }

    const approvedProfile: DoctorProfile = {
      ...user.profile as DoctorProfile,
      approved: true,
      profileComplete: true
    };

    return await this.update(userId, { profile: approvedProfile });
  }

  async searchByName(name: string, role?: UserRole): Promise<User[]> {
    try {
      // Firebase doesn't support case-insensitive search by default
      // This is a simplified version that matches exact names
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      let q;
      if (role) {
        q = query(
          usersRef,
          where('profile.firstName', '==', name),
          where('role', '==', role)
        );
      } else {
        q = query(usersRef, where('profile.firstName', '==', name));
      }
      
      const snapshot = await getDocs(q);
      return this.mapSnapshotToUsers(snapshot);
    } catch (error) {
      console.error('Error searching users by name:', error);
      throw error;
    }
  }

  async getIncompleteProfiles(): Promise<User[]> {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      const q = query(usersRef, where('profile.profileComplete', '==', false));
      const snapshot = await getDocs(q);
      
      return this.mapSnapshotToUsers(snapshot);
    } catch (error) {
      console.error('Error getting incomplete profiles:', error);
      throw error;
    }
  }

  async getUserWithProfile(userId: string): Promise<User | null> {
    return await this.getById(userId);
  }

  async updateMultiple(updates: { id: string; changes: Partial<User> }[]): Promise<User[]> {
    const updatedUsers: User[] = [];
    
    // Process updates in parallel (limited to avoid overwhelming Firestore)
    const batchSize = 5;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);
      const batchPromises = batch.map(update => this.update(update.id, update.changes));
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          updatedUsers.push(result.value);
        } else {
          console.error(`Failed to update user ${batch[index].id}:`, result.reason);
        }
      });
    }
    
    return updatedUsers;
  }

  async getAllUsers(limit?: number, offset?: number): Promise<User[]> {
    try {
      const { getFirestore, collection, query, orderBy, limit: limitFn, getDocs } = await import('firebase/firestore');
      const db = getFirestore();
      const usersRef = collection(db, this.collectionName);
      
      let q = query(usersRef, orderBy('createdAt', 'desc'));
      
      if (limit) {
        q = query(q, limitFn(limit));
      }
      
      const snapshot = await getDocs(q);
      let users = this.mapSnapshotToUsers(snapshot);
      
      // Apply offset client-side (Firebase doesn't support offset in the same way)
      if (offset) {
        users = users.slice(offset);
      }
      
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async getUserStats(): Promise<{
    total: number;
    doctors: number;
    patients: number;
    admins: number;
  }> {
    try {
      const [total, doctors, patients, admins] = await Promise.all([
        this.getAllUsers(1000), // Get up to 1000 users
        this.getDoctors(),
        this.getPatients(),
        this.getAdmins()
      ]);

      return {
        total: total.length,
        doctors: doctors.length,
        patients: patients.length,
        admins: admins.length
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      throw error;
    }
  }

  private async mapSnapshotToUsers(snapshot: any): Promise<User[]> {
    const users: User[] = [];
    
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      users.push(User.create({
        id: doc.id,
        email: data.email,
        role: data.role,
        profile: data.profile,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      }));
    });

    return users;
  }
}
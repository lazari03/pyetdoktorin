import { IRegistrationService, RegistrationData } from '@/application/ports/IRegistrationService';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebaseconfig';
import { UserRole } from '@/domain/entities/UserRole';

export class RegistrationService implements IRegistrationService {
  async register(data: RegistrationData): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const user = userCredential.user;

    const isDoctor = data.role === UserRole.Doctor;
    await setDoc(doc(db, 'users', user.uid), {
      name: data.name,
      surname: data.surname,
      phoneNumber: data.phone,
      email: data.email,
      role: data.role,
      ...(isDoctor ? { approvalStatus: 'pending' } : {}),
      createdAt: new Date().toISOString(),
    });

    if (isDoctor) {
      try {
        await addDoc(collection(db, 'notifications'), {
          type: 'doctor_registration',
          userId: user.uid,
          name: data.name,
          surname: data.surname,
          email: data.email,
          createdAt: serverTimestamp(),
          status: 'pending',
        });
      } catch (e) {
        console.warn('Failed to create admin notification for doctor registration', e);
      }
    }
  }
}

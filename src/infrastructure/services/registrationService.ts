import { IRegistrationService, RegistrationData } from '@/application/ports/IRegistrationService';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/config/firebaseconfig';
import { UserRole } from '@/domain/entities/UserRole';
import { backendFetch } from '@/network/backendClient';

export class RegistrationService implements IRegistrationService {
  async register(data: RegistrationData): Promise<void> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );
    const user = userCredential.user;
    const isDoctor = data.role === UserRole.Doctor;

    try {
      await backendFetch('/api/auth/register-profile', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          surname: data.surname,
          phone: data.phone,
          address: data.address,
          country: data.country,
          role: isDoctor ? UserRole.Doctor : UserRole.Patient,
        }),
      });
    } catch (error) {
      console.error('Failed to persist registration profile', error);
      throw new Error('Failed to complete registration');
    }

    try {
      const origin =
        typeof window !== 'undefined' && window.location?.origin
          ? window.location.origin
          : process.env.NEXT_PUBLIC_SITE_URL || 'https://pyetdoktorin.al';
      await sendEmailVerification(user, { url: `${origin}/verify-email?next=%2Fdashboard`, handleCodeInApp: true });
    } catch (e) {
      console.warn('Failed to send verification email', e);
    }
  }
}

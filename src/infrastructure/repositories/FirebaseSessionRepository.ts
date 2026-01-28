import { getAuth, signOut } from 'firebase/auth';
import { ISessionRepository } from '@/application/ports/ISessionRepository';

export class FirebaseSessionRepository implements ISessionRepository {
  logout(): void {
    const auth = getAuth();
    signOut(auth);
  }
}

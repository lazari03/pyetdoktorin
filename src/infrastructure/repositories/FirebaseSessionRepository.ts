import { getAuth, signOut } from 'firebase/auth';

export class FirebaseSessionRepository {
  logout(): void {
    const auth = getAuth();
    signOut(auth);
  }
}

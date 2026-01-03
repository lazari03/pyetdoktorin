export type UserRole = 'user' | 'doctor' | 'admin';

export interface User {
  id: string; // firebase id
  name: string;
  surname: string;
  email?: string; // optional for backward compatibility
  role: UserRole;
}

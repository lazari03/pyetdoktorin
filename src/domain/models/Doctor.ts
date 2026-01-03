import type { User } from './User';

export interface Doctor extends User {
  specialization: string;
  bio: string;
}

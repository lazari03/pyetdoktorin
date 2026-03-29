import { UserRole } from '@/domain/entities/UserRole';
import { IUserRepository } from '@/domain/repositories/IUserRepository';
import { fetchCurrentUserProfile } from '@/network/currentUser';

function toUserRole(value: string | UserRole | undefined): UserRole | null {
  switch (value) {
    case UserRole.Admin:
    case UserRole.Clinic:
    case UserRole.Doctor:
    case UserRole.Patient:
    case UserRole.Pharmacy:
      return value;
    default:
      return null;
  }
}

function isBlank(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'string') {
    return value.trim().length === 0;
  }

  return !value;
}

export class CurrentUserRepository implements IUserRepository {
  async getById(id: string): Promise<{ id: string; role: UserRole } | null> {
    const profile = await fetchCurrentUserProfile();
    if (profile.uid !== id) {
      return null;
    }

    const role = toUserRole(profile.role);
    if (!role) {
      return null;
    }

    return { id: profile.uid, role };
  }

  async getByRole(_role: UserRole): Promise<Array<{ id: string; role: UserRole }>> {
    return [];
  }

  async create(_payload: { id: string; role: UserRole }): Promise<void> {}

  async update(_id: string, _updates: Partial<{ role: UserRole }>): Promise<void> {}

  async delete(_id: string): Promise<void> {}

  async authenticate(_email: string, _password: string): Promise<{ id: string; role: UserRole } | null> {
    return null;
  }

  async isProfileIncomplete(role: UserRole, userId: string): Promise<boolean> {
    const profile = await fetchCurrentUserProfile();
    if (profile.uid !== userId) {
      return true;
    }

    switch (role) {
      case UserRole.Doctor:
        return (
          isBlank(profile.name) ||
          isBlank(profile.surname) ||
          isBlank(profile.phoneNumber) ||
          isBlank(profile.about) ||
          isBlank(profile.specializations)
        );
      case UserRole.Patient:
        return (
          isBlank(profile.name) ||
          isBlank(profile.surname) ||
          isBlank(profile.phoneNumber) ||
          isBlank(profile.email)
        );
      default:
        return true;
    }
  }
}

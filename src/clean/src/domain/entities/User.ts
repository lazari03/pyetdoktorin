export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin'
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileComplete: boolean;
}

export interface DoctorProfile extends UserProfile {
  specialization: string;
  licenseNumber: string;
  experience: number;
  clinic?: string;
  consultationFee: number;
  approved: boolean;
}

export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRole,
    public readonly profile: UserProfile | DoctorProfile,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(params: {
    id: string;
    email: string;
    role: UserRole;
    profile: UserProfile | DoctorProfile;
    createdAt: string;
    updatedAt: string;
  }): User {
    return new User(
      params.id,
      params.email,
      params.role,
      params.profile,
      params.createdAt,
      params.updatedAt
    );
  }

  isDoctor(): boolean {
    return this.role === UserRole.DOCTOR;
  }

  isPatient(): boolean {
    return this.role === UserRole.PATIENT;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isProfileComplete(): boolean {
    return this.profile.profileComplete;
  }

  updateProfile(newProfile: Partial<UserProfile | DoctorProfile>): User {
    const updatedProfile = { ...this.profile, ...newProfile };
    
    return User.create({
      ...this,
      profile: updatedProfile,
      updatedAt: new Date().toISOString()
    });
  }

  approveDoctor(): User {
    if (this.role !== UserRole.DOCTOR) {
      throw new Error('Only doctors can be approved');
    }

    const updatedProfile: DoctorProfile = {
      ...this.profile as DoctorProfile,
      approved: true,
      profileComplete: true
    };

    return User.create({
      ...this,
      profile: updatedProfile,
      updatedAt: new Date().toISOString()
    });
  }

  canApproveDoctors(): boolean {
    return this.role === UserRole.ADMIN;
  }
}
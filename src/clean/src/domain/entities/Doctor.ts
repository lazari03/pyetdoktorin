export interface DoctorProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
  licenseNumber: string;
  experience: number;
  clinic?: string;
  consultationFee: number;
  approved: boolean;
  averageRating?: number;
  totalRatings?: number;
  totalAppointments?: number;
  createdAt: string;
  updatedAt: string;
}

export class Doctor {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly email: string,
    public readonly phone: string | undefined,
    public readonly specialization: string,
    public readonly licenseNumber: string,
    public readonly experience: number,
    public readonly clinic: string | undefined,
    public readonly consultationFee: number,
    public readonly approved: boolean,
    public readonly averageRating: number | undefined,
    public readonly totalRatings: number | undefined,
    public readonly totalAppointments: number | undefined,
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) {}

  static create(params: DoctorProfile): Doctor {
    return new Doctor(
      params.id,
      params.userId,
      params.firstName,
      params.lastName,
      params.email,
      params.phone,
      params.specialization,
      params.licenseNumber,
      params.experience,
      params.clinic,
      params.consultationFee,
      params.approved,
      params.averageRating,
      params.totalRatings,
      params.totalAppointments,
      params.createdAt,
      params.updatedAt
    );
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isApproved(): boolean {
    return this.approved;
  }

  getRating(): number {
    return this.averageRating ?? 0;
  }

  updateRating(newRating: number, totalRatings: number): Doctor {
    return Doctor.create({
      ...this,
      averageRating: newRating,
      totalRatings,
      updatedAt: new Date().toISOString()
    });
  }

  approve(): Doctor {
    return Doctor.create({
      ...this,
      approved: true,
      updatedAt: new Date().toISOString()
    });
  }

  updateProfile(updates: Partial<DoctorProfile>): Doctor {
    return Doctor.create({
      ...this,
      ...updates,
      updatedAt: new Date().toISOString()
    });
  }

  incrementTotalAppointments(): Doctor {
    const total = this.totalAppointments ?? 0;
    return Doctor.create({
      ...this,
      totalAppointments: total + 1,
      updatedAt: new Date().toISOString()
    });
  }
}
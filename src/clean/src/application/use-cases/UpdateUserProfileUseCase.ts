import { User, UserRole } from '../../domain/entities/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';

export interface UpdateUserProfileDTO {
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  // Doctor-specific fields
  specialization?: string;
  licenseNumber?: string;
  experience?: number;
  clinic?: string;
  consultationFee?: number;
}

export interface UpdateUserProfileResult {
  user: User;
  success: boolean;
  error?: string;
}

export class UpdateUserProfileUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationRepository: INotificationRepository
  ) {}

  async execute(data: UpdateUserProfileDTO): Promise<UpdateUserProfileResult> {
    try {
      const user = await this.userRepository.getById(data.userId);
      if (!user) {
        return {
          user: null as any,
          success: false,
          error: 'User not found'
        };
      }

      // Prepare profile updates
      const profileUpdates: any = {};
      
      if (data.firstName !== undefined) profileUpdates.firstName = data.firstName;
      if (data.lastName !== undefined) profileUpdates.lastName = data.lastName;
      if (data.phone !== undefined) profileUpdates.phone = data.phone;
      
      // Add doctor-specific fields if user is a doctor
      if (user.isDoctor()) {
        if (data.specialization !== undefined) profileUpdates.specialization = data.specialization;
        if (data.licenseNumber !== undefined) profileUpdates.licenseNumber = data.licenseNumber;
        if (data.experience !== undefined) profileUpdates.experience = data.experience;
        if (data.clinic !== undefined) profileUpdates.clinic = data.clinic;
        if (data.consultationFee !== undefined) profileUpdates.consultationFee = data.consultationFee;
      }

      // Update user profile
      const updatedUser = await this.userRepository.updateProfile(data.userId, profileUpdates);

      // Check if profile is now complete
      const isProfileComplete = this.isProfileComplete(updatedUser);
      if (!user.isProfileComplete() && isProfileComplete) {
        // Send notification about profile completion
        // This would use notification service
      }

      return {
        user: updatedUser,
        success: true
      };
    } catch (error) {
      return {
        user: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  private isProfileComplete(user: User): boolean {
    const profile = user.profile;
    
    // Basic fields required for all users
    if (!profile.firstName || !profile.lastName || !profile.email) {
      return false;
    }

    // Additional fields required for doctors
    if (user.isDoctor()) {
      const doctorProfile = profile as any;
      return !!(
        doctorProfile.specialization &&
        doctorProfile.licenseNumber &&
        doctorProfile.experience !== undefined
      );
    }

    return true;
  }

  async approveDoctor(userId: string): Promise<UpdateUserProfileResult> {
    try {
      const user = await this.userRepository.getById(userId);
      if (!user || !user.isDoctor()) {
        return {
          user: null as any,
          success: false,
          error: 'Doctor user not found'
        };
      }

      const approvedUser = await this.userRepository.approveDoctor(userId);

      return {
        user: approvedUser,
        success: true
      };
    } catch (error) {
      return {
        user: null as any,
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve doctor'
      };
    }
  }

  async getUserProfile(userId: string): Promise<User | null> {
    return await this.userRepository.getUserWithProfile(userId);
  }
}
export interface QuickAppointmentMatch {
  doctorId: string;
  doctorName: string;
  specialties: string[];
  profilePicture?: string;
  nextAvailableAt: string;
  nextAvailableDate: string;
  nextAvailableTime: string;
  nextAvailableInMinutes: number;
  availableNow: boolean;
  hasPreviousMeetings: boolean;
  previousMeetingsCount: number;
}

export interface QuickAppointmentResponse {
  items: QuickAppointmentMatch[];
  specialties: string[];
  total: number;
  preferredDate: string;
  preferredTime: string;
}

export interface QuickAppointmentQuery {
  specialty?: string;
  preferredDate?: string;
  preferredTime?: string;
  limit?: number;
}
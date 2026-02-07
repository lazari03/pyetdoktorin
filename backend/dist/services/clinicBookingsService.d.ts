export type ClinicBookingStatus = 'pending' | 'confirmed' | 'declined';
export interface ClinicBookingInput {
    clinicId: string;
    clinicName: string;
    patientId: string;
    patientName: string;
    patientEmail: string;
    patientPhone?: string;
    note: string;
    preferredDate?: string;
}
export interface ClinicBooking extends ClinicBookingInput {
    id: string;
    status: ClinicBookingStatus;
    createdAt: string;
}
export declare function createClinicBooking(input: ClinicBookingInput): Promise<ClinicBooking>;
export declare function listBookingsByClinic(clinicId: string): Promise<ClinicBooking[]>;
export declare function listBookingsByPatient(patientId: string): Promise<ClinicBooking[]>;
export declare function listAllBookings(limit?: number): Promise<ClinicBooking[]>;
export declare function updateClinicBookingStatus(id: string, status: ClinicBookingStatus): Promise<void>;
//# sourceMappingURL=clinicBookingsService.d.ts.map
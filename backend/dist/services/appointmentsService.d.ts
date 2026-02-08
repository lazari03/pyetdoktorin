import { UserRole } from '../domain/entities/UserRole';
export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export interface AppointmentInput {
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    appointmentType?: string;
    preferredDate: string;
    preferredTime?: string;
    note?: string;
    notes?: string;
}
export interface Appointment extends AppointmentInput {
    id: string;
    status: AppointmentStatus;
    isPaid: boolean;
    createdAt: number;
}
export declare function listAppointmentsForUser(uid: string, role: UserRole): Promise<Appointment[]>;
export declare function createAppointment(input: AppointmentInput): Promise<Appointment>;
export declare function getAppointmentById(id: string): Promise<Appointment | null>;
export declare function updateAppointmentStatus(id: string, status: AppointmentStatus, actor: UserRole): Promise<void>;
export declare function markAppointmentPaid(id: string, transactionId: string): Promise<void>;
//# sourceMappingURL=appointmentsService.d.ts.map
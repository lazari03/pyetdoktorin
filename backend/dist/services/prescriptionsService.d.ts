import { UserRole } from '@/domain/entities/UserRole';
export type PrescriptionStatus = 'pending' | 'accepted' | 'rejected';
export interface PrescriptionInput {
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    pharmacyId?: string;
    pharmacyName?: string;
    medicines: string[];
    dosage?: string;
    notes?: string;
    title?: string;
    signatureDataUrl?: string;
}
export interface Prescription extends PrescriptionInput {
    id: string;
    status: PrescriptionStatus;
    createdAt: number;
}
export declare function createPrescription(input: PrescriptionInput): Promise<Prescription>;
export declare function listPrescriptionsForRole(uid: string, role: UserRole): Promise<Prescription[]>;
export declare function updatePrescriptionStatus(id: string, status: PrescriptionStatus): Promise<void>;
//# sourceMappingURL=prescriptionsService.d.ts.map

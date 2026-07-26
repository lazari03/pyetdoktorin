import { AppointmentStatus } from './AppointmentStatus';

export interface Appointment {
	id: string;
	doctorId: string;
	doctorName: string;
	patientId?: string;
	patientName?: string;
	requesterId?: string;
	requesterName?: string;
	payerId?: string;
	familyMemberId?: string;
	appointmentType: string;
	preferredDate: string;
	preferredTime: string;
	notes: string;
	isPaid: boolean;
	paymentStatus?: string;
	paymentStartedAt?: number;
	paymentProvider?: string;
	transactionId?: string;
	paidAt?: number;
	feeAmount?: number;
	feeCurrency?: string;
	createdAt: string;
	status: AppointmentStatus;
	roomId?: string; // 100ms room UUID
	roomCode?: string; // 100ms prebuilt code
	dismissedBy?: { [userId: string]: boolean }; // notification dismissal tracking
}

import { AppointmentStatus } from './AppointmentStatus';

export interface Appointment {
	id: string;
	doctorId: string;
	doctorName: string;
	patientId: string;
	patientName?: string;
	appointmentType: string;
	preferredDate: string;
	preferredTime: string;
	notes: string;
	isPaid: boolean;
	paymentStatus?: string;
	createdAt: string;
	status: AppointmentStatus;
	roomId?: string; // 100ms room UUID
	roomCode?: string; // 100ms prebuilt code
	dismissedBy?: { [userId: string]: boolean }; // notification dismissal tracking
}

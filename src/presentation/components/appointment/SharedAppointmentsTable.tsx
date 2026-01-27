import React from 'react';
import { useTranslation } from 'react-i18next';
import CenteredLoader from '../CenteredLoader';
import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';
import { getAppointmentAction } from '@/presentation/utils/appointmentActionButton';
import { DEFAULT_APPOINTMENT_PAYMENT_AMOUNT } from '@/config/paymentConfig';

interface AppointmentsTableProps {
	appointments: Appointment[];
	role: string;
	isAppointmentPast: (appointment: Appointment) => boolean;
	handleJoinCall: (appointmentId: string) => void;
	handlePayNow: (appointmentId: string, amount: number) => void;
	showActions?: boolean;
	maxRows?: number;
	loading?: boolean;
}

export const AppointmentsTable: React.FC<AppointmentsTableProps> = ({
	appointments,
	role,
	isAppointmentPast,
	handleJoinCall,
	handlePayNow,
	showActions = true,
	maxRows = 3,
	loading = false,
}) => {
	const { t } = useTranslation();
  
	if (loading) {
		return <CenteredLoader />;
	}

	// ...existing code...
	return <></>;
};

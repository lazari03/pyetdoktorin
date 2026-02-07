// Types for AppointmentsTable component props
import { Appointment } from '@/domain/entities/Appointment';
import { UserRole } from '@/domain/entities/UserRole';

export interface AppointmentsTableProps {
  appointments: Appointment[];
  role: UserRole;
  isAppointmentPast: (appointment: Appointment) => boolean;
  handleJoinCall: (appointmentId: string) => void;
  handlePayNow: (appointmentId: string, amount: number) => void;
  showActions?: boolean;
  maxRows?: number;
  loading?: boolean;
  variant?: 'default' | 'minimal';
}

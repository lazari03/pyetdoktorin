// Types for AppointmentsTable component props
import { Appointment } from '@/domain/entities/Appointment';

export interface AppointmentsTableProps {
  appointments: Appointment[];
  role: string;
  isAppointmentPast: (appointment: Appointment) => boolean;
  handleJoinCall: (appointmentId: string) => void;
  handlePayNow: (appointmentId: string, amount: number) => void;
  showActions?: boolean;
  maxRows?: number;
  loading?: boolean;
}

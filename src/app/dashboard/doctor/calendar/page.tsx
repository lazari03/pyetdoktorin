'use client';

import RoleGuard from '../../../components/RoleGuard';
import { UserRole } from '../../../../models/UserRole';
import Calendar from '../Calendar';

export default function DoctorCalendarPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.Doctor]} fallbackPath="/dashboard">
      <div>
        <h1 className="text-2xl font-bold">Doctor's Calendar</h1>
        <Calendar />
      </div>
    </RoleGuard>
  );
}

'use client';

import RoleGuard from '../../components/RoleGuard';

export default function PatientsPage() {
  return (
    <RoleGuard allowedRoles={['doctor']}>
      <div>
        <h1 className="text-2xl font-bold mb-4">My Patients</h1>
        {/* Rest of the patients page content */}
      </div>
    </RoleGuard>
  );
}

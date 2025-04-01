'use client';

import RoleGuard from '../../components/RoleGuard';
import DoctorSearch from '@/app/components/DoctorSearch';

export default function SearchDoctorsPage() {
  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Find a Doctor</h1>
        <DoctorSearch />
      </div>
    </RoleGuard>
  );
}
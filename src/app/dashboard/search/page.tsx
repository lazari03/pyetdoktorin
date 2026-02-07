'use client';

import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import DoctorSearch from '@/presentation/components/doctor/DoctorSearch';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/domain/entities/UserRole';

export default function SearchDoctorsPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={[UserRole.Patient]}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('findADoctor')}</h1>
        <DoctorSearch />
      </div>
    </RoleGuard>
  );
}

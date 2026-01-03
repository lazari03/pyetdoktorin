'use client';

import RoleGuard from '../../components/RoleGuard';
import DoctorSearch from '../../components/doctor/DoctorSearch';
import { useTranslation } from 'react-i18next';

export default function SearchDoctorsPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('findADoctor')}</h1>
        <DoctorSearch />
      </div>
    </RoleGuard>
  );
}
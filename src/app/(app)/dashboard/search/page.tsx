'use client';

import RoleGuard from '@/presentation/components/RoleGuard/RoleGuard';
import DoctorSearch from '@/presentation/components/doctor/DoctorSearch';
import { useTranslation } from 'react-i18next';
import { UserRole } from '@/domain/entities/UserRole';

export default function SearchDoctorsPage() {
  const { t } = useTranslation();
  return (
    <RoleGuard allowedRoles={[UserRole.Patient]}>
      <div className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10 space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-[15px] font-bold text-gray-900">
              {t('findADoctor')}
            </h1>
            <p className="text-[12.5px] text-gray-500">
              {t('searchHint') || 'Start typing at least 4 characters to search'}
            </p>
          </div>
          <DoctorSearch />
        </div>
      </div>
    </RoleGuard>
  );
}

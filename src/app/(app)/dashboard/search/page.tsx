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
        <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:py-10 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
              {t('secureAccessEyebrow') ?? 'Secure access'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {t('findADoctor')}
            </h1>
            <p className="text-sm text-gray-600">
              {t('searchHint') || 'Start typing at least 4 characters to search'}
            </p>
          </div>
          <DoctorSearch />
        </div>
      </div>
    </RoleGuard>
  );
}

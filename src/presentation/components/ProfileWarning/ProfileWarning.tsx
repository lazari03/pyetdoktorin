'use client';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { DASHBOARD_PATHS } from '@/navigation/paths';

interface ProfileWarningProps {
  show: boolean;
}

export default function ProfileWarning({ show }: ProfileWarningProps) {
  const { t } = useTranslation();
  
  if (!show) return null;
  return (
    <div className="relative mb-6 rounded-2xl border border-amber-200 bg-amber-50/80 shadow-sm overflow-hidden px-4 py-3 flex items-start gap-3">
      <div className="mt-0.5 h-9 w-9 rounded-full bg-white text-amber-600 border border-amber-200 flex items-center justify-center shadow-sm">
        <span className="text-lg font-semibold">!</span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-amber-800">
          {t('profileIncompleteWarningTitle') || 'Complete your profile'}
        </p>
        <p className="text-xs text-amber-700">
          {t('profileIncompleteWarning') || 'Add your details to keep your care team informed and unlock all features.'}
        </p>
      </div>
      <div>
        <Link
          href={DASHBOARD_PATHS.profile}
          className="text-xs font-semibold text-purple-700 hover:text-purple-800 underline"
        >
          {t('editProfile') || 'Update now'}
        </Link>
      </div>
    </div>
  );
}

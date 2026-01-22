'use client';
import { useTranslation } from 'react-i18next';

interface ProfileWarningProps {
  show: boolean;
}

export default function ProfileWarning({ show }: ProfileWarningProps) {
  const { t } = useTranslation();
  
  if (!show) return null;
  return (
    <div className="alert alert-warning mb-6">
      <span>{t('profileIncompleteWarning')}</span>
    </div>
  );
}

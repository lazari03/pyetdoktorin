'use client';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PasswordResetSectionProps {
  handlePasswordReset: () => void;
  resetEmailSent: boolean;
}

const PasswordResetSection = ({ handlePasswordReset, resetEmailSent }: PasswordResetSectionProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="mt-2 text-center">
      <button
        type="button"
        onClick={handlePasswordReset}
        className="text-purple-700 font-semibold hover:text-purple-500 underline focus:outline-none"
      >
        {t('requestPasswordReset')}
      </button>
      {resetEmailSent && (
        <p className="text-green-600 mt-2 text-sm">
          {t('passwordResetEmailSent')}
        </p>
      )}
    </div>
  );
};

export default PasswordResetSection;

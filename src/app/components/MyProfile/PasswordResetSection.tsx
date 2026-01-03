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
    <div className="mt-8 text-center">
      <button
        type="button"
        onClick={handlePasswordReset}
        className="text-black hover:text-orange-500 underline focus:outline-none"
      >
        {t('requestPasswordReset')}
      </button>
      {resetEmailSent && (
        <p className="text-green-500 mt-4">
          {t('passwordResetEmailSent')}
        </p>
      )}
    </div>
  );
};

export default PasswordResetSection;

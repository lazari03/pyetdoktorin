import React from 'react';

interface PasswordResetSectionProps {
  handlePasswordReset: () => void;
  resetEmailSent: boolean;
}

const PasswordResetSection = ({ handlePasswordReset, resetEmailSent }: PasswordResetSectionProps) => (
  <div className="mt-8 text-center">
    <button
      type="button"
      onClick={handlePasswordReset}
      className="text-black hover:text-orange-500 underline focus:outline-none"
    >
      Request to reset your password
    </button>
    {resetEmailSent && (
      <p className="text-green-500 mt-4">
        Password reset email sent successfully!
      </p>
    )}
  </div>
);

export default PasswordResetSection;

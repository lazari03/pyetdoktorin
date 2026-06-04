"use client";

import "@/i18n/i18n";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { Button } from '@/presentation/ui/Button';
import { Card } from '@/presentation/ui/Card';
import { Input } from '@/presentation/ui/Input';
import { useToast } from '@/presentation/components/Toast/ToastProvider';
import { ROUTES } from '@/config/routes';
import { notifyFormSubmission } from '@/presentation/utils/formNotifications';
import { trackAnalyticsEvent } from '@/presentation/utils/trackAnalyticsEvent';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { resetUserPasswordUseCase } = useDI();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackAnalyticsEvent('password_reset_requested');
    try {
      await resetUserPasswordUseCase.execute(email);
      void notifyFormSubmission({
        formType: 'forgot_password',
        source: 'forgot_password_page',
        subject: `Password reset requested: ${email}`,
        replyTo: email,
        data: {
          email,
        },
      });
      trackAnalyticsEvent('password_reset_success');
      setSubmitted(true);
      toast({ variant: 'success', message: t('passwordResetEmailSent') });
    } catch {
      toast({ variant: 'error', message: t('passwordResetEmailFailed') });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center mb-4 text-gray-900">
            {t('forgotPassword')}
          </h2>
          {submitted ? (
            <p className="text-center text-gray-700">
              {t('forgotPasswordSuccess')}
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="form-control gap-4">
              <div>
                <label className="label">
                  <span className="label-text text-gray-900">{t('email')}</span>
                </label>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full mt-2">
                {t('resetPassword')}
              </Button>
            </form>
          )}
          <div className="text-center mt-4">
            <Link href={ROUTES.LOGIN} className="link text-primary">
              {t('backToLogin')}
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDI } from '@/context/DIContext';
import { useToast } from '@/presentation/components/Toast/ToastProvider';

export default function ExportActivityLogButton() {
  const { t } = useTranslation();
  const { requestUserNotificationsExportUseCase } = useDI();
  const { toast } = useToast();
  const [requesting, setRequesting] = useState(false);

  const handleRequestExport = async () => {
    setRequesting(true);
    try {
      await requestUserNotificationsExportUseCase.execute();
      toast({
        variant: 'success',
        message: t('activityLogExportSent') || "Check your email — you'll receive your activity log shortly.",
      });
    } catch {
      toast({
        variant: 'error',
        message: t('activityLogExportFailed') || 'Could not send your activity log. Please try again.',
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleRequestExport}
      disabled={requesting}
      className="w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors disabled:opacity-50"
    >
      {requesting
        ? t('loading') || 'Loading...'
        : t('requestActivityLogExport') || 'Email me my activity log'}
    </button>
  );
}

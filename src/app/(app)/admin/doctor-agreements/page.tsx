"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { ToastProvider, useToast } from '../components/ToastProvider';
import { useTranslation } from 'react-i18next';
import '@i18n';
import { useDI } from '@/context/DIContext';
import RequestStateGate from '@/presentation/components/RequestStateGate/RequestStateGate';
import { StatsPageSkeleton } from '@/presentation/components/Skeleton/StatsPageSkeleton';
import { ADMIN_PATHS } from '@/navigation/paths';

function DoctorAgreementsTable() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { listDoctorAgreementsUseCase, downloadDoctorAgreementPdfUseCase } = useDI();
  const { data: items, error, isLoading, mutate } = useSWR('doctor-agreements', () => listDoctorAgreementsUseCase.execute());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (doctorId: string) => {
    setDownloadingId(doctorId);
    try {
      const blob = await downloadDoctorAgreementPdfUseCase.execute(doctorId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `doctor-agreement-${doctorId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      showToast(t('downloadFailed') || 'Failed to download PDF', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <RequestStateGate
      loading={isLoading}
      error={error}
      onRetry={() => mutate()}
      homeHref={ADMIN_PATHS.root}
      loadingLabel={t('loading')}
      skeleton={<StatsPageSkeleton />}
      analyticsPrefix="admin.doctor_agreements"
    >
      <div className="space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.13em] text-purple-600">
            {t('secureAccessEyebrow') ?? 'Secure access'}
          </p>
          <h1 className="text-[15px] font-bold text-gray-900">{t('doctorAgreements') || 'Doctor Agreements'}</h1>
          <p className="text-[12.5px] text-gray-500">
            {t('doctorAgreementsSubtitle') || 'Signed terms & conditions submitted by doctors.'}
          </p>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[640px] w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-4 py-2.5">
                    {t('doctors') || 'Doctor'}
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                    {t('email') || 'Email'}
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                    {t('termsVersion') || 'Terms version'}
                  </th>
                  <th className="text-left text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-3 py-2.5">
                    {t('signedAt') || 'Signed'}
                  </th>
                  <th className="text-right text-[10px] font-bold uppercase tracking-[.06em] text-gray-400 px-4 py-2.5">
                    {t('actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {!items || items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                      {t('noDoctorAgreements') || 'No signed agreements yet'}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.doctorId} className="border-t border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-gray-900">{item.doctorName}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-500">{item.doctorEmail}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{item.termsVersion}</td>
                      <td className="px-3 py-3 text-[12px] text-gray-700">{new Date(item.signedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownload(item.doctorId)}
                          disabled={downloadingId === item.doctorId}
                          className="inline-flex items-center rounded-full border border-purple-500 px-3 py-1.5 text-[11.5px] font-semibold text-purple-600 hover:bg-purple-500 hover:text-white transition disabled:opacity-50"
                          data-analytics="admin.doctor_agreements.download_pdf"
                          data-analytics-id={item.doctorId}
                        >
                          {downloadingId === item.doctorId ? t('sending') || 'Downloading…' : t('downloadPdf') || 'Download PDF'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </RequestStateGate>
  );
}

export default function AdminDoctorAgreementsPage() {
  return (
    <ToastProvider>
      <DoctorAgreementsTable />
    </ToastProvider>
  );
}

'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SignaturePad } from '@/presentation/components/SignaturePad';
import { useDoctorAgreement } from '@/presentation/hooks/useDoctorAgreement';

export function DoctorAgreementSection() {
  const { t } = useTranslation();
  const { terms, status, loading, submitting, submitError, submit } = useDoctorAgreement();
  const [signatureDataUrl, setSignatureDataUrl] = useState('');
  const [resigning, setResigning] = useState(false);

  if (loading) {
    return (
      <section className="bg-white rounded-3xl border border-purple-50 shadow-lg p-6">
        <div className="h-24 animate-pulse rounded-2xl bg-gray-100" />
      </section>
    );
  }

  if (!terms) return null;

  const outOfDate = Boolean(status?.signed && status.termsVersion !== terms.version);
  const needsSignature = !status?.signed || outOfDate || resigning;

  const handleSubmit = async () => {
    if (!signatureDataUrl) return;
    const ok = await submit(signatureDataUrl);
    if (ok) {
      setSignatureDataUrl('');
      setResigning(false);
    }
  };

  return (
    <section className="bg-white rounded-3xl border border-purple-50 shadow-lg p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
          {t('doctorContractEyebrow') || 'Agreement'}
        </p>
        <h2 className="text-lg font-semibold text-gray-900">{terms.title}</h2>
      </div>

      {status?.signed && !needsSignature && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between gap-3 flex-wrap">
          <span>
            {t('doctorContractSignedOn', { date: new Date(status.signedAt!).toLocaleDateString() }) ||
              `Signed on ${new Date(status.signedAt!).toLocaleDateString()}`}
          </span>
          <button
            type="button"
            onClick={() => setResigning(true)}
            className="text-xs font-semibold text-green-800 hover:underline"
            data-analytics="profile.doctor_contract.resign"
          >
            {t('doctorContractResign') || 'Sign again'}
          </button>
        </div>
      )}

      {outOfDate && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {t('doctorContractOutOfDate') || 'The terms have been updated since you last signed. Please review and sign again.'}
        </div>
      )}

      {needsSignature && (
        <>
          <div className="max-h-64 overflow-y-auto rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3 text-[13px] leading-relaxed text-gray-700">
            {terms.paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <SignaturePad onChange={setSignatureDataUrl} />

          {submitError ? (
            <p className="text-xs text-red-600">
              {t('doctorContractSubmitFailed') || 'Could not submit your signature. Please try again.'}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2">
            {status?.signed && (
              <button
                type="button"
                onClick={() => { setResigning(false); setSignatureDataUrl(''); }}
                className="inline-flex items-center rounded-full border border-gray-200 px-4 py-1.5 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                {t('cancel') || 'Cancel'}
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!signatureDataUrl || submitting}
              className="inline-flex items-center rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              data-analytics="profile.doctor_contract.submit"
            >
              {submitting ? t('sending') || 'Sending…' : t('doctorContractSubmit') || 'Sign & submit'}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

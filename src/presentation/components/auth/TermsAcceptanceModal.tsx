'use client';

import { useTranslation } from 'react-i18next';
import type { PlatformTerms } from '@/application/ports/IPlatformTermsService';
import { z } from '@/config/zIndex';

type Props = {
  terms: PlatformTerms | null;
  loading: boolean;
  onAccept: () => void;
  onClose: () => void;
};

export function TermsAcceptanceModal({ terms, loading, onAccept, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 ${z.modal}`} onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div
        className={`relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-purple-100 overflow-hidden ${z.modalContent}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-[0.18em] text-purple-600 font-semibold">
            {t('termsModalEyebrow') || 'Before you continue'}
          </p>
          <h2 className="text-lg font-semibold text-gray-900 mt-1">
            {terms?.title || t('termsAndConditions') || 'Terms & Conditions'}
          </h2>
        </div>

        <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-3 text-[13px] leading-relaxed text-gray-700">
          {loading || !terms ? (
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-5/6 animate-pulse rounded bg-gray-100" />
              <div className="h-3 w-4/6 animate-pulse rounded bg-gray-100" />
            </div>
          ) : (
            terms.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            data-analytics="auth.register.terms_modal.close"
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onAccept}
            disabled={loading || !terms}
            className="inline-flex items-center rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            data-analytics="auth.register.terms_modal.accept"
          >
            {t('termsAccept') || 'I have read and accept'}
          </button>
        </div>
      </div>
    </div>
  );
}

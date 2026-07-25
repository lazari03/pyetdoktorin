import { useState } from 'react';
import useSWR from 'swr';
import { useDI } from '@/context/DIContext';

export function useDoctorAgreement() {
  const { getDoctorTermsUseCase, getMyDoctorAgreementUseCase, submitDoctorAgreementUseCase } = useDI();
  const { data: terms, error: termsError, isLoading: termsLoading } = useSWR(
    'doctor-terms',
    () => getDoctorTermsUseCase.execute(),
  );
  const { data: status, error: statusError, isLoading: statusLoading, mutate } = useSWR(
    'my-doctor-agreement',
    () => getMyDoctorAgreementUseCase.execute(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const submit = async (signatureDataUrl: string) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitDoctorAgreementUseCase.execute(signatureDataUrl);
      await mutate(result, { revalidate: false });
      return true;
    } catch (error) {
      setSubmitError(error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    terms,
    status,
    loading: termsLoading || statusLoading,
    error: termsError || statusError,
    submitting,
    submitError,
    submit,
  };
}

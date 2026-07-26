import { useState } from 'react';
import useSWR from 'swr';
import { useDI } from '@/context/DIContext';
import type { CreateSupportTicketInput } from '@/application/ports/ISupportTicketService';

export function useSupportTickets() {
  const { createSupportTicketUseCase, listMySupportTicketsUseCase } = useDI();
  const { data, isLoading, mutate } = useSWR('my-support-tickets', () => listMySupportTicketsUseCase.execute());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<unknown>(null);

  const submit = async (input: CreateSupportTicketInput) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createSupportTicketUseCase.execute(input);
      await mutate();
      return true;
    } catch (error) {
      setSubmitError(error);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    tickets: data ?? [],
    loading: isLoading,
    submitting,
    submitError,
    submit,
  };
}

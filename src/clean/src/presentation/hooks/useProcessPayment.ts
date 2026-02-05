import { useState } from 'react';
import { ProcessPaymentUseCase, ProcessPaymentDTO } from '../../../application/use-cases/ProcessPaymentUseCase';
import { PaymentMethod, PaymentStatus } from '../../../domain/entities/Payment';

export interface UseProcessPaymentParams {
  processPaymentUseCase: ProcessPaymentUseCase;
}

export interface UseProcessPaymentReturn {
  processPayment: (data: ProcessPaymentDTO) => Promise<boolean>;
  completePayment: (paymentId: string, transactionId: string) => Promise<boolean>;
  failPayment: (paymentId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  resetError: () => void;
}

export const useProcessPayment = ({
  processPaymentUseCase
}: UseProcessPaymentParams): UseProcessPaymentReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processPayment = async (data: ProcessPaymentDTO): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const result = await processPaymentUseCase.execute(data);
      
      if (result.success) {
        return true;
      } else {
        setError(result.error || 'Failed to process payment');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const completePayment = async (paymentId: string, transactionId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await processPaymentUseCase.completePayment(paymentId, transactionId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete payment';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const failPayment = async (paymentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await processPaymentUseCase.failPayment(paymentId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fail payment';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetError = () => {
    setError(null);
  };

  return {
    processPayment,
    completePayment,
    failPayment,
    loading,
    error,
    resetError
  };
};
import { IPaymentGateway } from '@/application/ports/IPaymentGateway';
import { IAnalyticsService } from '@/application/ports/IAnalyticsService';

export class CapturePaywallPaymentUseCase {
  constructor(
    private gateway: IPaymentGateway,
    private analytics?: IAnalyticsService
  ) {}

  async execute(orderId: string, appointmentId: string): Promise<{ status: string; appointmentId?: string }> {
    try {
      const result = await this.gateway.captureOrder(orderId, appointmentId);
      
      if (result.status === 'COMPLETED' && result.appointmentId) {
        this.analytics?.track('payment_completed', {
          orderId,
          appointmentId: result.appointmentId,
        });
      } else {
        this.analytics?.track('payment_failed', {
          orderId,
          status: result.status,
        });
      }
      
      return result;
    } catch (error) {
      this.analytics?.track('payment_failed', {
        orderId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}

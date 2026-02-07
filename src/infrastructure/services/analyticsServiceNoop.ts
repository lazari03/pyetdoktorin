import { IAnalyticsService } from '@/application/ports/IAnalyticsService';

/**
 * No-op analytics service for testing or when analytics is disabled
 */
export class NoopAnalyticsService implements IAnalyticsService {
  track(_eventName: string, _params?: Record<string, string | number | boolean>): void {
    // No-op
  }

  pageView(_pagePath: string, _pageTitle?: string): void {
    // No-op
  }

  identify(_userId: string, _traits?: Record<string, unknown>): void {
    // No-op
  }
}

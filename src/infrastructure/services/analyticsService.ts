import { IAnalyticsService, AnalyticsEvent } from '@/application/ports/IAnalyticsService';

/**
 * Google Analytics 4 implementation of analytics service
 * Safe for SSR - checks for window/gtag availability
 */
export class GA4AnalyticsService implements IAnalyticsService {
  private isClient: boolean;
  private measurementId: string | undefined;

  constructor() {
    this.isClient = typeof window !== 'undefined';
    this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
  }

  private get gtag(): ((...args: unknown[]) => void) | null {
    if (!this.isClient) return null;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    return w.gtag || null;
  }

  track(eventName: AnalyticsEvent | string, params?: Record<string, string | number | boolean>): void {
    if (!this.isClient || !this.gtag) return;
    
    try {
      this.gtag('event', eventName, {
        ...params,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Silent fail - analytics should not break functionality
      console.warn('Analytics track failed:', error);
    }
  }

  pageView(pagePath: string, pageTitle?: string): void {
    if (!this.isClient || !this.gtag || !this.measurementId) return;

    try {
      this.gtag('config', this.measurementId, {
        page_path: pagePath,
        page_title: pageTitle,
      });
    } catch (error) {
      console.warn('Analytics pageView failed:', error);
    }
  }

  identify(userId: string, traits?: Record<string, unknown>): void {
    if (!this.isClient || !this.gtag) return;

    try {
      this.gtag('config', this.measurementId || '', {
        user_id: userId,
        ...traits,
      });
    } catch (error) {
      console.warn('Analytics identify failed:', error);
    }
  }
}

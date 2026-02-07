export interface IAnalyticsService {
  track(eventName: string, params?: Record<string, string | number | boolean>): void;
  pageView(pagePath: string, pageTitle?: string): void;
  identify(userId: string, traits?: Record<string, unknown>): void;
}

export type AnalyticsEvent =
  | 'appointment_created'
  | 'appointment_accepted'
  | 'appointment_declined'
  | 'payment_initiated'
  | 'payment_completed'
  | 'payment_failed'
  | 'video_session_started'
  | 'video_session_ended'
  | 'prescription_created'
  | 'prescription_accepted'
  | 'prescription_rejected'
  | 'user_registered'
  | 'user_logged_in';

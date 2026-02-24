import type { TFunction } from 'i18next';
import { APPOINTMENT_ERROR_CODES, VIDEO_ERROR_CODES } from '@/config/errorCodes';

const CODE_PATTERN = /^[A-Z0-9_]+$/;

const tryParseJson = (value: string): { error?: unknown } | null => {
  try {
    return JSON.parse(value) as { error?: unknown };
  } catch {
    return null;
  }
};

export const extractErrorCode = (error: unknown): string | null => {
  if (!error || typeof error !== 'object') {
    if (error instanceof Error) {
      return extractErrorCode(error.message);
    }
    return null;
  }

  const maybeCode = (error as { code?: unknown }).code;
  if (typeof maybeCode === 'string') return maybeCode;

  if (error instanceof Error) {
    const message = error.message;
    const parsed = tryParseJson(message);
    if (parsed && typeof parsed.error === 'string') return parsed.error;
    if (CODE_PATTERN.test(message)) return message;
  }

  return null;
};

const APPOINTMENT_CODE_TO_I18N: Record<string, string> = {
  [APPOINTMENT_ERROR_CODES.RequiredFields]: 'missingRequiredFields',
  [APPOINTMENT_ERROR_CODES.PreferredTimeRequired]: 'missingRequiredFields',
  [APPOINTMENT_ERROR_CODES.SlotTaken]: 'timeSlotAlreadyBooked',
  [APPOINTMENT_ERROR_CODES.NotFound]: 'appointmentNotFound',
  [APPOINTMENT_ERROR_CODES.StatusInvalid]: 'unknownError',
  [APPOINTMENT_ERROR_CODES.StatusMissing]: 'missingRequiredFields',
  [APPOINTMENT_ERROR_CODES.Forbidden]: 'accessDenied',
  [APPOINTMENT_ERROR_CODES.CreateFailed]: 'appointmentBookingFailed',
  [APPOINTMENT_ERROR_CODES.UpdateFailed]: 'unknownError',
  [APPOINTMENT_ERROR_CODES.FetchFailed]: 'unknownError',
  [APPOINTMENT_ERROR_CODES.PaymentNotAllowed]: 'paymentNotAllowed',
};

const VIDEO_CODE_TO_I18N: Record<string, string> = {
  [VIDEO_ERROR_CODES.AuthMissing]: 'joinCallLoginRequired',
  [VIDEO_ERROR_CODES.AuthInvalid]: 'sessionExpired',
  [VIDEO_ERROR_CODES.UserMismatch]: 'accessDenied',
  [VIDEO_ERROR_CODES.AppointmentNotFound]: 'appointmentNotFound',
  [VIDEO_ERROR_CODES.AppointmentForbidden]: 'accessDenied',
  [VIDEO_ERROR_CODES.AppointmentCancelled]: 'appointmentCancelled',
  [VIDEO_ERROR_CODES.AppointmentFinished]: 'appointmentFinished',
  [VIDEO_ERROR_CODES.PaymentRequired]: 'paymentRequired',
  [VIDEO_ERROR_CODES.AppointmentNotAccepted]: 'appointmentNotAccepted',
  [VIDEO_ERROR_CODES.RoleNotAllowed]: 'videoRoleNotAllowed',
  [VIDEO_ERROR_CODES.HmsConfigMissing]: 'videoConfigMissing',
  [VIDEO_ERROR_CODES.TemplateMissing]: 'videoTemplateMissing',
  [VIDEO_ERROR_CODES.GenericFailed]: 'videoSessionFailed',
  [VIDEO_ERROR_CODES.MissingParams]: 'missingRequiredFields',
  [VIDEO_ERROR_CODES.MethodNotAllowed]: 'unknownError',
  [VIDEO_ERROR_CODES.SessionSecretMissing]: 'videoConfigMissing',
};

export const getAppointmentErrorMessage = (error: unknown, t: TFunction): string | null => {
  const code = extractErrorCode(error);
  if (!code) return null;
  const key = APPOINTMENT_CODE_TO_I18N[code];
  return key ? t(key) : null;
};

export const getVideoErrorMessage = (error: unknown, t: TFunction): string | null => {
  const code = extractErrorCode(error);
  if (!code) return null;
  const key = VIDEO_CODE_TO_I18N[code];
  return key ? t(key) : null;
};

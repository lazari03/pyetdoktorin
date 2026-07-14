export const UserNotificationErrorCode = {
  NotFound: 'USER_NOTIFICATION_NOT_FOUND',
  Forbidden: 'USER_NOTIFICATION_FORBIDDEN',
  CreateFailed: 'USER_NOTIFICATION_CREATE_FAILED',
  FetchFailed: 'USER_NOTIFICATION_FETCH_FAILED',
  UpdateFailed: 'USER_NOTIFICATION_UPDATE_FAILED',
  CleanupFailed: 'USER_NOTIFICATION_CLEANUP_FAILED',
  ExportFailed: 'USER_NOTIFICATION_EXPORT_FAILED',
  EmailNotConfigured: 'USER_NOTIFICATION_EMAIL_NOT_CONFIGURED',
} as const;

export type UserNotificationErrorCodeValue =
  (typeof UserNotificationErrorCode)[keyof typeof UserNotificationErrorCode];

export class UserNotificationError extends Error {
  readonly code: UserNotificationErrorCodeValue;
  readonly status: number;

  constructor(code: UserNotificationErrorCodeValue, status: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.name = 'UserNotificationError';
  }
}

export class UserNotificationNotFoundError extends UserNotificationError {
  constructor() {
    super(UserNotificationErrorCode.NotFound, 404);
    this.name = 'UserNotificationNotFoundError';
  }
}

export class UserNotificationForbiddenError extends UserNotificationError {
  constructor() {
    super(UserNotificationErrorCode.Forbidden, 403);
    this.name = 'UserNotificationForbiddenError';
  }
}

export class UserNotificationEmailNotConfiguredError extends UserNotificationError {
  constructor() {
    super(UserNotificationErrorCode.EmailNotConfigured, 503);
    this.name = 'UserNotificationEmailNotConfiguredError';
  }
}

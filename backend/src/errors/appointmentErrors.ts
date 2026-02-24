export const AppointmentErrorCode = {
  MissingRequiredFields: 'APPOINTMENT_REQUIRED_FIELDS',
  PreferredTimeRequired: 'APPOINTMENT_PREFERRED_TIME_REQUIRED',
  SlotTaken: 'APPOINTMENT_SLOT_TAKEN',
  NotFound: 'APPOINTMENT_NOT_FOUND',
  StatusInvalid: 'APPOINTMENT_STATUS_INVALID',
  StatusMissing: 'APPOINTMENT_STATUS_MISSING',
  Forbidden: 'APPOINTMENT_FORBIDDEN',
  CreateFailed: 'APPOINTMENT_CREATE_FAILED',
  UpdateFailed: 'APPOINTMENT_UPDATE_FAILED',
  FetchFailed: 'APPOINTMENT_FETCH_FAILED',
  PaymentNotAllowed: 'APPOINTMENT_PAYMENT_NOT_ALLOWED',
} as const;

export type AppointmentErrorCodeValue =
  (typeof AppointmentErrorCode)[keyof typeof AppointmentErrorCode];

export class AppointmentError extends Error {
  readonly code: AppointmentErrorCodeValue;
  readonly status: number;

  constructor(code: AppointmentErrorCodeValue, status: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.name = 'AppointmentError';
  }
}

export class SlotAlreadyBookedError extends AppointmentError {
  constructor() {
    super(AppointmentErrorCode.SlotTaken, 409);
    this.name = 'SlotAlreadyBookedError';
  }
}

export class PreferredTimeRequiredError extends AppointmentError {
  constructor() {
    super(AppointmentErrorCode.PreferredTimeRequired, 400);
    this.name = 'PreferredTimeRequiredError';
  }
}

export class AppointmentNotFoundError extends AppointmentError {
  constructor() {
    super(AppointmentErrorCode.NotFound, 404);
    this.name = 'AppointmentNotFoundError';
  }
}

export class InvalidAppointmentStatusError extends AppointmentError {
  constructor() {
    super(AppointmentErrorCode.StatusInvalid, 400);
    this.name = 'InvalidAppointmentStatusError';
  }
}

export class PaymentNotAllowedError extends AppointmentError {
  constructor() {
    super(AppointmentErrorCode.PaymentNotAllowed, 409);
    this.name = 'PaymentNotAllowedError';
  }
}

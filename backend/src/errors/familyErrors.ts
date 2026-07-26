export const FamilyMemberErrorCode = {
  NotFound: 'FAMILY_MEMBER_NOT_FOUND',
  Forbidden: 'FAMILY_MEMBER_FORBIDDEN',
  CreateFailed: 'FAMILY_MEMBER_CREATE_FAILED',
  FetchFailed: 'FAMILY_MEMBER_FETCH_FAILED',
  UpdateFailed: 'FAMILY_MEMBER_UPDATE_FAILED',
} as const;

export type FamilyMemberErrorCodeValue =
  (typeof FamilyMemberErrorCode)[keyof typeof FamilyMemberErrorCode];

export class FamilyMemberError extends Error {
  readonly code: FamilyMemberErrorCodeValue;
  readonly status: number;

  constructor(code: FamilyMemberErrorCodeValue, status: number, message?: string) {
    super(message ?? code);
    this.code = code;
    this.status = status;
    this.name = 'FamilyMemberError';
  }
}

export class FamilyMemberNotFoundError extends FamilyMemberError {
  constructor(message?: string) {
    super(FamilyMemberErrorCode.NotFound, 404, message);
    this.name = 'FamilyMemberNotFoundError';
  }
}

export class FamilyMemberForbiddenError extends FamilyMemberError {
  constructor(message?: string) {
    super(FamilyMemberErrorCode.Forbidden, 403, message);
    this.name = 'FamilyMemberForbiddenError';
  }
}

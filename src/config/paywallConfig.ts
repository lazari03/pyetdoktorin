const DEFAULT_PAYWALL_AMOUNT = 13;
const DEFAULT_PAYOUT_PERCENTAGE = 70;

const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const PAYWALL_AMOUNT_USD = parseNumber(
  process.env.NEXT_PUBLIC_PAYWALL_AMOUNT_USD ?? process.env.PAYWALL_AMOUNT_USD,
  DEFAULT_PAYWALL_AMOUNT
);

export const PAYWALL_CURRENCY = 'USD';

export const APPOINTMENT_PRICE_EUR = parseNumber(
  process.env.NEXT_PUBLIC_APPOINTMENT_PRICE_EUR,
  PAYWALL_AMOUNT_USD
);

export const APPOINTMENT_PRICE_CURRENCY =
  process.env.NEXT_PUBLIC_APPOINTMENT_PRICE_CURRENCY ??
  process.env.APPOINTMENT_PRICE_CURRENCY ??
  'EUR';

export const DOCTOR_PAYOUT_PERCENTAGE = parseNumber(
  process.env.NEXT_PUBLIC_DOCTOR_PAYOUT_PERCENTAGE ?? process.env.DOCTOR_PAYOUT_PERCENTAGE,
  DEFAULT_PAYOUT_PERCENTAGE
);

export const DOCTOR_PAYOUT_RATE = DOCTOR_PAYOUT_PERCENTAGE / 100;

export const PAYMENT_PROCESSING_TIMEOUT_MINUTES = parseNumber(
  process.env.NEXT_PUBLIC_PAYMENT_PROCESSING_TIMEOUT_MINUTES ?? process.env.PAYMENT_PROCESSING_TIMEOUT_MINUTES,
  5
);

export const PAYMENT_PROCESSING_TIMEOUT_MS = PAYMENT_PROCESSING_TIMEOUT_MINUTES * 60_000;

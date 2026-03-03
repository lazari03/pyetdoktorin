/* eslint-disable no-console */

function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseUrl(value, name) {
  if (!isNonEmpty(value)) return null;
  try {
    return new URL(value);
  } catch {
    console.error(`✗ Invalid URL for ${name}: ${value}`);
    process.exitCode = 1;
    return null;
  }
}

function warn(message) {
  console.warn(`⚠ ${message}`);
}

function fail(message) {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
}

function check() {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProd = nodeEnv === "production";

  // Canonical site URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  const parsedSite = parseUrl(siteUrl, "SITE_URL/NEXT_PUBLIC_SITE_URL");
  if (!parsedSite) {
    warn("SITE_URL/NEXT_PUBLIC_SITE_URL is not set. Recommended for origin validation and correct cookies/redirects.");
  }

  // Cookie domain
  const cookieDomain = (process.env.NEXT_PUBLIC_COOKIE_DOMAIN || process.env.COOKIE_DOMAIN || "").trim();
  if (cookieDomain) {
    if (cookieDomain === "localhost" || cookieDomain.includes("localhost")) {
      fail("COOKIE_DOMAIN must not be set for localhost.");
    }
    if (!cookieDomain.startsWith(".")) {
      warn("COOKIE_DOMAIN should usually start with '.' (e.g. .pyetdoktorin.al) to include subdomains.");
    }
  }

  // Contact email config
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.CONTACT_EMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.CONTACT_EMAIL_PASS;
  const smtpService = process.env.SMTP_SERVICE;

  const hasMail =
    (isNonEmpty(smtpHost) && isNonEmpty(smtpUser) && isNonEmpty(smtpPass)) ||
    (isNonEmpty(smtpService) && isNonEmpty(smtpUser) && isNonEmpty(smtpPass));

  if (isProd && !hasMail) {
    warn("SMTP is not configured. Website contact form will return 503 in production.");
  }

  // Paddle/paywall config (optional but commonly expected)
  const paddleClientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const paddlePriceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  if (isProd && (isNonEmpty(paddleClientToken) !== isNonEmpty(paddlePriceId))) {
    warn("Paddle config is partially set. Set BOTH NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID (or neither).");
  }

  // GA config (optional)
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID;
  if (isProd && !isNonEmpty(gaId)) {
    warn("Google Analytics ID is not set (NEXT_PUBLIC_GA_MEASUREMENT_ID). AnalyticsScripts will be disabled.");
  }

  // Observability sink for client error reports (optional but strongly recommended)
  const sinkList = (process.env.CLIENT_ERROR_SINKS || process.env.LOG_SINKS || "").trim();
  const hasBetterStack = isNonEmpty(process.env.BETTERSTACK_SOURCE_TOKEN) || isNonEmpty(process.env.LOGTAIL_SOURCE_TOKEN);
  const hasDatadog = isNonEmpty(process.env.DATADOG_API_KEY);
  const hasAnySink = isNonEmpty(sinkList) || hasBetterStack || hasDatadog;

  if (isProd && !hasAnySink) {
    warn("No client-error log sink configured. /api/client-error will only log to stdout. Set CLIENT_ERROR_SINKS=betterstack,datadog and provide tokens (BETTERSTACK_SOURCE_TOKEN or DATADOG_API_KEY).");
  }
}

check();

if (process.exitCode) {
  console.error("\nEnv check failed. Fix the items above and try again.");
} else {
  console.log("✓ Env check passed (or only warnings).");
}

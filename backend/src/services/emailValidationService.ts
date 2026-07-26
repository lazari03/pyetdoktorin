import dns from 'dns';

// Curated list of common disposable/temporary email providers. Not
// exhaustive — there is no free, complete registry of these — but it covers
// the services people actually reach for to dodge signup verification.
// ponytail: static list, not a live third-party lookup API; revisit if abuse
// patterns show a gap.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'mailinator.net', 'mailinator2.com', 'tmailinator.com',
  'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamail.biz', 'guerrillamailblock.com',
  '10minutemail.com', '10minutemail.net', '10minutemail.co.za',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailaddress.com', 'tempinbox.com', 'tempmailo.com',
  'throwawaymail.com', 'throwawayemailaddress.com', 'trashmail.com', 'trashmail.de', 'trash-mail.com',
  'fakeinbox.com', 'fakemailgenerator.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'mintemail.com',
  'sharklasers.com', 'grr.la', 'guerrillamail.info', 'spam4.me', 'pokemail.net', 'trbvm.com', 'e4ward.com',
  'spamex.com', 'mailexpire.com', 'boximail.com', 'deadaddress.com', 'mt2015.com', 'tmpmail.org', 'tmpeml.com',
  'emlpro.com', 'emlhub.com', 'correotemporal.org', 'tempr.email', 'harakirimail.com', 'jetable.org',
  'mailimate.com', 'mailslite.com', 'nada.email', 'no-spam.ws', 'nowmymail.com', 'objectmail.com',
  'proxymail.eu', 'rcpt.at', 'recode.me', 'safersignup.de', 'sneakemail.com', 'spambob.com', 'spamcannon.com',
  'spamcorptastic.com', 'spamfree24.org', 'spamhole.com', 'spaml.com', 'thisisnotmyrealemail.com', 'tyldd.com',
  'veryrealemail.com', 'wegwerfmail.de', 'moakt.cc', 'mohmal.com', 'emailondeck.com', 'mailnesia.com',
  'mailcatch.com', 'discard.email', '33mail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
]);

// Explicit exception: yopmail is a genuinely disposable service (it's in the
// blocklist above) but the product intentionally allows it — likely for
// testing/QA signups. Keep it out of the blocklist check rather than
// removing it from DISPOSABLE_DOMAINS, so the list stays an accurate record
// of "services that are disposable" separately from "services we allow".
const ALLOWED_EXCEPTIONS = new Set(['yopmail.com', 'yopmail.fr', 'yopmail.net']);

export type EmailValidationReason = 'invalid_format' | 'disposable' | 'no_mx';

export interface EmailValidationResult {
  valid: boolean;
  reason?: EmailValidationReason;
}

function extractDomain(email: string): string | null {
  const match = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(email.trim().toLowerCase());
  return match?.[1] ?? null;
}

export async function validateRegistrationEmail(email: string): Promise<EmailValidationResult> {
  const domain = extractDomain(email);
  if (!domain) {
    return { valid: false, reason: 'invalid_format' };
  }

  if (DISPOSABLE_DOMAINS.has(domain) && !ALLOWED_EXCEPTIONS.has(domain)) {
    return { valid: false, reason: 'disposable' };
  }

  try {
    const records = await dns.promises.resolveMx(domain);
    if (!records || records.length === 0) {
      return { valid: false, reason: 'no_mx' };
    }
  } catch {
    // No MX records resolvable — the domain can't actually receive mail.
    return { valid: false, reason: 'no_mx' };
  }

  return { valid: true };
}

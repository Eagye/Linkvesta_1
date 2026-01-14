// List of known disposable/temporary email providers
// This matches the backend list for consistency
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  '20minutemail.com',
  '33mail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.com',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'mohmal.com',
  'fakeinbox.com',
  'trashmail.com',
  'meltmail.com',
  'mintemail.com',
  'spamgourmet.com',
  'sharklasers.com',
  'grr.la',
  'guerrillamailblock.com',
  'pokemail.net',
  'spamhole.com',
  'temp-mail.org',
  'emailondeck.com',
  'throwawaymail.com',
  'mytemp.email',
  'tmpmail.org',
  'maildrop.cc',
  'getairmail.com',
  'dispostable.com',
  'mailcatch.com',
  'melt.li',
  'spamfree24.org',
  'spamfree24.de',
  'spamfree24.eu',
  'spamfree24.net',
  'spamfree24.com',
  'spamgourmet.com',
  'spamhole.com',
  'spamtraps.com',
  'tempail.com',
  'tempinbox.co.uk',
  'tempinbox.com',
  'tempmail.eu',
  'tempmail.it',
  'tempmail2.com',
  'tempmailer.com',
  'tempthe.net',
  'thankyou2010.com',
  'thisisnotmyrealemail.com',
  'throwaway.emailaddress.com',
  'tilien.com',
  'tmail.ws',
  'tmailinator.com',
  'toiea.com',
  'tradermail.info',
  'trash-amil.com',
  'trashmail.at',
  'trashmail.com',
  'trashmail.de',
  'trashmail.me',
  'trashmail.net',
  'trashmail.org',
  'trashymail.com',
  'trialmail.de',
  'trillianpro.com',
  'turual.com',
  'twinmail.de',
  'tyldd.com',
  'uggsrock.com',
  'umail.net',
  'us.af',
  'venompen.com',
  'veryrealemail.com',
  'viditag.com',
  'viewcastmedia.com',
  'viewcastmedia.net',
  'viewcastmedia.org',
  'webemail.me',
  'webm4il.info',
  'wh4f.org',
  'whyspam.me',
  'willselfdestruct.com',
  'winemaven.info',
  'wronghead.com',
  'wuzup.net',
  'wuzupmail.net',
  'xagloo.com',
  'xemaps.com',
  'xents.com',
  'xmaily.com',
  'xoxy.net',
  'yapped.net',
  'yeah.net',
  'yep.it',
  'yogamaven.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'youmailr.com',
  'ypmail.webnetic.me',
  'zippymail.info',
  'zoemail.org',
  'zomg.info',
  'zoemail.com',
  'zoemail.net',
  'zoemail.org',
];

/**
 * Check if an email address is from a disposable/temporary email provider
 * @param email - The email address to check
 * @returns true if the email is from a disposable provider, false otherwise
 */
export const isDisposableEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailLower = email.toLowerCase().trim();
  const domain = emailLower.split('@')[1];

  if (!domain) {
    return false;
  }

  // Check against the list of disposable email domains
  return DISPOSABLE_EMAIL_DOMAINS.includes(domain);
};

/**
 * Get a user-friendly error message for disposable emails
 */
export const getDisposableEmailMessage = (): string => {
  return 'Please use a permanent email address. Temporary or disposable email addresses are not allowed for account registration.';
};

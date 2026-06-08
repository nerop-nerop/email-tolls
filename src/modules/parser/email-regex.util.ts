const EMAIL_REGEX =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

const DEFAULT_SKIP_PREFIXES = [
  'noreply',
  'no-reply',
  'donotreply',
  'mailer-daemon',
  'postmaster',
];

export interface ParsedEmail {
  email: string;
  name?: string;
  company?: string;
}

export function extractEmailsFromText(text: string): string[] {
  const matches = text.match(EMAIL_REGEX) ?? [];
  return [...new Set(matches.map((e) => e.toLowerCase()))];
}

export function shouldSkipEmail(
  email: string,
  skipPrefixes: string[] = DEFAULT_SKIP_PREFIXES,
): boolean {
  const local = email.split('@')[0]?.toLowerCase() ?? '';
  return skipPrefixes.some((p) => local.startsWith(p));
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

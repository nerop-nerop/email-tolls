"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractEmailsFromText = extractEmailsFromText;
exports.shouldSkipEmail = shouldSkipEmail;
exports.normalizeEmail = normalizeEmail;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
const DEFAULT_SKIP_PREFIXES = [
    'noreply',
    'no-reply',
    'donotreply',
    'mailer-daemon',
    'postmaster',
];
function extractEmailsFromText(text) {
    const matches = text.match(EMAIL_REGEX) ?? [];
    return [...new Set(matches.map((e) => e.toLowerCase()))];
}
function shouldSkipEmail(email, skipPrefixes = DEFAULT_SKIP_PREFIXES) {
    const local = email.split('@')[0]?.toLowerCase() ?? '';
    return skipPrefixes.some((p) => local.startsWith(p));
}
function normalizeEmail(email) {
    return email.trim().toLowerCase();
}
//# sourceMappingURL=email-regex.util.js.map
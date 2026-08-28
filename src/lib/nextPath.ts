/**
 * Where to send someone after they sign in or accept the consent.
 *
 * `/exam.html` is a separate document on the same origin, so a candidate
 * sent from the exam to the login screen cannot be returned by a route
 * change — the destination has to be carried in the URL and then navigated
 * to properly.
 *
 * **The value is untrusted.** It arrives in a query string, which anyone can
 * write, and following it blindly is an open redirect: a link to our own
 * login page that lands the candidate on someone else's, with our name in
 * the address bar they just came from. So the rule is deliberately narrow
 * and rejects rather than repairs.
 */
export function safeNext(search: string): string | null {
  let raw: string | null = null;
  try {
    raw = new URLSearchParams(search).get('next');
  } catch {
    return null;
  }
  if (!raw) return null;

  // Must be a path on this origin. A single leading slash, and no second
  // one — `//evil.example` is a protocol-relative URL and a browser follows
  // it off-site. Backslashes are normalised to slashes by some parsers, so
  // they are refused outright rather than reasoned about.
  if (!raw.startsWith('/')) return null;
  if (raw.startsWith('//') || raw.startsWith('/\\')) return null;
  if (raw.includes('\\')) return null;
  if (/^\/+[a-z][a-z0-9+.-]*:/i.test(raw)) return null;
  return raw;
}

/** Follow it, whether it is a route in this document or another document. */
export function goNext(next: string): void {
  window.location.assign(next);
}

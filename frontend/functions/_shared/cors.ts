/* CORS — explicit allowlist, no wildcards. */

const STATIC_ALLOWED = new Set<string>([
  'https://tims.org.au',
  'https://www.tims.org.au',
]);

function isAllowedOrigin(origin: string, primaryDomain: string, embedParents: string): boolean {
  if (!origin) return false;
  if (STATIC_ALLOWED.has(origin)) return true;
  if (origin === `https://${primaryDomain}`) return true;
  if (origin === `http://${primaryDomain}`) return true;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  for (const host of embedParents.split(',').map((s) => s.trim()).filter(Boolean)) {
    if (origin === `https://${host}` || origin === `http://${host}`) return true;
  }
  return false;
}

export function corsHeaders(origin: string, primaryDomain: string, embedParents: string): Headers {
  const h = new Headers();
  if (isAllowedOrigin(origin, primaryDomain, embedParents)) {
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Vary', 'Origin');
    h.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Content-Type');
    h.set('Access-Control-Max-Age', '86400');
  }
  return h;
}

export function withCors(res: Response, origin: string, primaryDomain: string, embedParents: string): Response {
  const headers = new Headers(res.headers);
  const cors = corsHeaders(origin, primaryDomain, embedParents);
  cors.forEach((v, k) => headers.set(k, v));
  return new Response(res.body, { status: res.status, headers });
}

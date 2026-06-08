# Explanation: Security

The app is a public, no-login lead magnet, so the security surface is small but
deliberate. This explains the controls in place and the reasoning behind them.

## Threat model in brief

There are no user accounts, sessions, or privileged actions — nothing to take
over. The realistic risks are:

1. **Spam / bot lead submissions** polluting the leads list.
2. **Abuse of the embed** (someone framing the app from a hostile origin to
   read postMessages or proxy actions).
3. **PII exposure** of captured leads.

The controls below map to these.

## Turnstile on lead capture

`POST /api/lead` is the only endpoint that writes PII, and it's the only one that
requires a **Cloudflare Turnstile** token. The flow
(`functions/_shared/turnstile.ts`):

1. The client obtains an (invisible) Turnstile token.
2. The server POSTs `{ secret, response }` to Cloudflare's siteverify endpoint.
3. Only a `success: true` response lets the insert proceed; otherwise `403`.

The verifier fails **closed**: missing token, missing secret, non-200 from
siteverify, or a thrown error all return `false`. Warnings are logged (tail them
per [How-to: Monitor and debug](../how-to/monitor-and-debug.md)).

The other write endpoints (`/api/complete`, `/api/share`) are unauthenticated
because they store no PII and the worst case is junk anonymous rows — not worth
adding friction (a Turnstile challenge) to every completion.

## CORS — explicit allowlist, no wildcards

`functions/api/_middleware.ts` wraps every `/api/*` response with CORS headers
from `functions/_shared/cors.ts`. The allowlist (`isAllowedOrigin`) permits:

- `https://tims.org.au` and `https://www.tims.org.au` (static allowlist)
- `https://${PRIMARY_DOMAIN}` (and `http://` of it)
- `localhost` / `127.0.0.1` on any port (for dev)
- each host in the `EMBED_PARENT_DOMAINS` env var

Anything else gets **no** `Access-Control-Allow-Origin` header at all, so the
browser blocks the cross-origin read. `OPTIONS` preflights are answered directly
by the middleware. There is **no `*` wildcard** anywhere — origins are reflected
only after passing the allowlist.

Note the `/r/` and `/og/` routes intentionally have **no** CORS headers: they're
top-level navigations / crawler fetches, not XHR, so CORS doesn't apply.

## Iframe sandbox + postMessage origin checks

The challenge runs inside an iframe on the Squarespace page. Two boundaries:

- **Sandbox** — the embed (`embed/EMBED_SNIPPET.html`) sets a minimal `sandbox`
  attribute: `allow-scripts allow-same-origin allow-forms allow-popups
  allow-popups-to-escape-sandbox`, plus `allow="clipboard-write; web-share"`.
  Just enough to run the SPA, submit the form, copy a share link, and open
  outbound links — nothing more.
- **postMessage origin lock** — the resize handshake only accepts messages whose
  `e.origin === https://cybersecurity.tims.org.au`. A hostile parent or a
  message from any other origin is ignored. The resize math also avoids a
  feedback loop (matches content height exactly, ignores sub-5px deltas).

## Content-Security-Policy on the share page

`/r/:session_id` sets
`Content-Security-Policy: frame-ancestors 'self' https://tims.org.au
https://www.tims.org.au`, so the share landing page can only be framed by TIMS
properties — preventing clickjacking via embedding elsewhere.

## Input validation

Every write endpoint validates its body with **Zod** before touching the
database, with tight constraints: UUID session IDs, bounded integers, an email
format, a phone regex, a 4-digit AU postcode, a fixed `platform` enum, and length
caps on free-text and UTM fields. Invalid input returns `400` with the issue
list; nothing unvalidated reaches a SQL bind. All queries use **parameterised
binds** (`.bind(...)`), so there's no string-interpolated SQL.

## Consent gating

`/api/lead` rejects (`400`) unless `consent_program` is `true`. Marketing consent
is a separate boolean defaulting to `false`. See
[Explanation: Privacy and data](privacy-and-data.md).

## Secrets handling

- `TURNSTILE_SECRET` is a Cloudflare Pages **secret**, never committed. The
  public **site key** is the only Turnstile value in the repo.
- CI auth (`CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`) lives in GitHub
  Actions secrets.
- `.dev.vars` and `.env.local` are gitignored.

See [How-to: Manage secrets](../how-to/manage-secrets.md) and
[Reference: Configuration](../reference/configuration.md).

## What's deliberately not here

No rate limiting beyond Turnstile, no WAF rules, no audit logging. At expected
community-program volume these would be over-engineering. If the program scales
or starts attracting abuse, Cloudflare's dashboard offers rate-limiting and bot
controls that can be layered on without code changes.

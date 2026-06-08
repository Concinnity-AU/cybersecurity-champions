# Explanation: Architecture

This explains the *why* behind the system's shape. For exact endpoint and schema
facts, see the [Reference](../reference/) section.

## The one-project design

Everything — the static React SPA **and** the API / share / OG routes — is a
**single Cloudflare Pages project**, served from one custom domain
(`cybersecurity.tims.org.au`).

```
┌────────────────────────────────────────────────────────────────────┐
│  Squarespace page (tims.org.au/cybersecurity)                       │
│   └─ Code Block embed → iframe (postMessage resize)                 │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  Cloudflare Pages — cybersecurity.tims.org.au                       │
│  ├─ Static assets (Vite-built React SPA)                            │
│  └─ Pages Functions (file-based routing):                           │
│      • /api/challenges  → randomised challenge set from D1          │
│      • /api/complete    → record completion, return share/og URLs   │
│      • /api/lead        → Turnstile-verified lead capture           │
│      • /api/share       → record share event                        │
│      • /r/:session_id   → server-rendered share landing + OG meta   │
│      • /og/:session.png → dynamic 1200×630 PNG (satori + resvg)     │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
                ┌──────────────────────────┐
                │  Cloudflare D1 (SQLite)  │
                │  challenges · leads ·    │
                │  completions · shares    │
                └──────────────────────────┘
```

**Why one project?** Co-locating the SPA and its API on the same origin means:

- No cross-origin calls from the SPA to its own API in normal operation (the
  API base is empty — same origin). CORS only matters for the *embedded* case.
- One deploy, one domain, one TLS cert, one thing to reason about. For a
  community lead-magnet maintained by one person, fewer moving parts wins.
- Server-rendered share pages and dynamic OG images live right next to the data
  they need (D1), with no separate service.

## File-based routing

Pages Functions map files under `frontend/functions/` to URL paths:

| File | Route |
|---|---|
| `functions/api/health.ts` | `/api/health` |
| `functions/api/challenges.ts` | `/api/challenges` |
| `functions/api/complete.ts` | `/api/complete` |
| `functions/api/lead.ts` | `/api/lead` |
| `functions/api/share.ts` | `/api/share` |
| `functions/r/[session_id].ts` | `/r/:session_id` |
| `functions/og/[session_id].png.ts` | `/og/:session_id.png` |
| `functions/api/_middleware.ts` | runs for every `/api/*` route |
| `functions/_shared/*` | not routed — imported helpers |

The `_middleware.ts` sits in `functions/api/` specifically so it wraps **only**
API routes with CORS — the `/r/` and `/og/` routes deliberately don't get CORS
headers because they're loaded directly by browsers and social crawlers, not via
`fetch`.

`_shared/` holds the non-routed helpers: `db.ts` (D1 queries), `selection.ts`
(quiz assembly), `tiers.ts` (scoring), `turnstile.ts` (verification), `cors.ts`,
`og-image.ts`, and `types.ts`.

## The SPA as a state machine

`frontend/src/App.tsx` is a single component driving a stage machine:

```
welcome → loading → challenge ⇄ (feedback) → submitting → result → thanks
                        ↑                                      │
                        └──────────── restart ────────────────┘
   (any load failure) → error
```

The SPA holds all quiz state (current index, score, streak, per-question answer
log) in React state and only talks to the backend at three points: fetch
challenges (start), post completion (last question), post lead (form submit).
Scoring and feedback are client-side for instant response — this is a low-stakes
awareness quiz, so the answers are intentionally shipped to the client (see
[Reference: API](../reference/api.md)).

If `/api/complete` fails, the SPA still shows a result screen with a fallback
tier rather than blocking the user on an analytics call — UX is prioritised over
perfect telemetry.

## Runtime config injection

The SPA reads config from `window.__CONFIG__` (injected by Pages at runtime in
production) and falls back to Vite build-time `VITE_*` vars
(`frontend/src/lib/config.ts`). This lets the same build behave correctly across
environments without rebuilding. See
[Reference: Configuration](../reference/configuration.md).

## Session threading

A `session_id` (UUID) is minted by `/api/challenges` and threaded through every
subsequent call. It's the join key linking a quiz run → its completion → an
optional lead → share events, and it's what makes `/r/:id` and `/og/:id.png`
personalisable. `/api/complete` upserts by `session_id`, so retries or
double-submits don't create duplicate completions.

## Share / OG rendering

`/og/:session_id.png` renders a personalised image at request time:
**satori** turns a JSX/CSS layout into SVG, then **@resvg/resvg-wasm** rasterises
it to PNG. This needs `nodejs_compat` (set in `wrangler.toml`) and the Manrope
`.ttf` fonts in `public/fonts/`. The image is cached `immutable` so each session
renders once. `/r/:session_id` is the HTML wrapper carrying the Open Graph tags
that point social crawlers at that image.

## Deployment topology

- **Cloudflare resources** (Pages, Functions, D1, Turnstile) live in the
  **Concinnity** account.
- **The GitHub repo** lives in the Concinnity org and auto-deploys on push to
  `main` via `.github/workflows/deploy.yml`.
- **The domain** `tims.org.au` is managed by **TIMS** on a non-Cloudflare DNS
  provider; the `cybersecurity` subdomain is a CNAME to the Pages project. This
  cross-DNS split is the fiddliest part of setup — see
  [Tutorial: Production setup](../tutorials/production-setup.md).
</content>

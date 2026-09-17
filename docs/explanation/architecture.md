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
│      • /api/start       → record challenge start + attribution      │
│      • /api/complete    → record completion, return share/og URLs   │
│      • /api/event       → record course CTA / workshop click        │
│      • /api/lead        → Turnstile-verified updates sign-up        │
│      • /api/share       → record share event                        │
│      • /r/:session_id   → server-rendered share landing + OG meta   │
│      • /og/:session.png → dynamic 1200×630 PNG (satori + resvg)     │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
                ┌──────────────────────────┐
                │  Cloudflare D1 (SQLite)  │
                │  challenges · sessions · │
                │  completions · events ·  │
                │  leads · shares          │
                └──────────────────────────┘
```

**Why one project?** Co-locating the SPA and its API on the same origin means:

- No cross-origin calls from the SPA to its own API in normal operation (the
  API base is empty — same origin). CORS only matters for the *embedded* case.
- One deploy, one domain, one TLS cert, one thing to reason about. For a
  community awareness tool maintained by one person, fewer moving parts wins.
- Server-rendered share pages and dynamic OG images live right next to the data
  they need (D1), with no separate service.

## File-based routing

Pages Functions map files under `frontend/functions/` to URL paths:

| File | Route |
|---|---|
| `functions/api/health.ts` | `/api/health` |
| `functions/api/challenges.ts` | `/api/challenges` |
| `functions/api/start.ts` | `/api/start` |
| `functions/api/complete.ts` | `/api/complete` |
| `functions/api/event.ts` | `/api/event` |
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
(quiz assembly), `tiers.ts` (scoring), `turnstile.ts` (verification),
`attribution.ts` (shared UTM/referrer validation for `/api/start` and
`/api/lead`), `cors.ts`, `og-image.ts`, and `types.ts`.

## The SPA as a state machine

`frontend/src/App.tsx` is a single component driving a stage machine:

```
welcome → loading → challenge ⇄ (feedback) → submitting → result
                        ↑                                   │
                        └──────────── restart ─────────────┘
   (any load failure) → error
```

The result screen (`components/Result.tsx`) shows the score, tier and breakdown
**immediately** — nothing is gated behind a form. Below the score it shows, in
order: the primary call to action (the free Tribal Habits course, with the
registration code to copy), the optional updates sign-up
(`components/LeadForm.tsx`), share buttons, and a small "Ask about workshops"
link. Score-based bridge copy lives in `lib/strings.ts` (`STRINGS.result`).

The SPA holds all quiz state (current index, score, streak, per-question answer
log) in React state and talks to the backend at these points:

| When | Call | Blocking? |
|---|---|---|
| Challenge set requested | `GET /api/challenges` | yes |
| Challenge set loaded | `POST /api/start` (session + attribution) | no — fire-and-forget |
| Last question answered | `POST /api/complete` | yes (with fallback) |
| Course CTA / workshop link clicked | `POST /api/event` | no — fire-and-forget |
| Share button clicked | `POST /api/share` | no — fire-and-forget |
| Sign-up form submitted | `POST /api/lead` | yes |

Scoring and feedback are client-side for instant response — this is a low-stakes
awareness quiz, so the answers are intentionally shipped to the client (see
[Reference: API](../reference/api.md)).

If `/api/complete` fails, the SPA still shows a result screen with a fallback
tier rather than blocking the user on an analytics call — UX is prioritised over
perfect telemetry.

## Runtime config

The SPA reads config from `window.__CONFIG__` (an optional runtime-override hook,
**not currently populated** in production) and otherwise uses the build-time `VITE_*` vars
(`frontend/src/lib/config.ts`). This lets the same build behave correctly across
environments without rebuilding. See
[Reference: Configuration](../reference/configuration.md).

## Session threading

A `session_id` (UUID) is minted by `/api/challenges` and threaded through every
subsequent call. It's the join key linking a quiz run's start (`sessions`) → its
completion → click events → an optional lead → share events, and it's what makes
`/r/:id` and `/og/:id.png` personalisable. `/api/start` is `INSERT OR IGNORE`
and `/api/complete` upserts by `session_id`, so retries or double-submits don't
create duplicates. A retake gets a new `session_id`, so each attempt is counted
separately.

## Funnel and attribution

The funnel is **started** (`sessions`) → **completed** (`completions`) →
**course CTA click** (`events`). Leads are a separate measure, not a step the
user must pass through. Course enrolment happens on Tribal Habits and isn't
visible to this system.

Attribution is captured once, on landing, by `frontend/src/lib/attribution.ts`:

- `utm_source` / `utm_medium` / `utm_campaign` / `utm_content` come from the page
  URL.
- `referrer` is a **hostname only** — from `document.referrer` when standalone,
  or from the `ref` query parameter when embedded.
- The result is cached in `sessionStorage` for the tab, so retakes keep the
  first touch; landing again via a URL with fresh UTMs replaces it.

It's sent with `/api/start` (stored on `sessions`) and `/api/lead` (stored on
`leads`). The server lower-cases source/medium/campaign so "Facebook" and
"facebook" group together, but keeps `utm_content` verbatim because it carries
creative IDs (e.g. from Publer).

When embedded, the iframe can't see the Squarespace page's URL, so the embed
snippet copies the page's `utm_*` parameters and the visitor's referring
hostname (`ref`) onto the iframe `src`. See
[How-to: Update the embed](../how-to/update-the-embed.md).

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

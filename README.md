# Cybersecurity Champions Challenge

Interactive awareness challenge for the Toowoomba International Multicultural Society (TIMS) **Cybersecurity Champions** program — a free cybersecurity training program for community members, run in partnership with **Concinnity Consulting**.

A 90-second, mobile-first challenge with ten rapid scenarios drawn from real scams reported to Australian authorities. Designed to be embedded into the Squarespace site at `tims.org.au/cybersecurity` as well as hosted standalone at `cybersecurity.tims.org.au`.

> Deeper architecture, security, and operational docs live in [`docs/`](docs/README.md). The original Claude Design handoff (prototype, brand assets, content pack) is preserved under `_handoff/` for reference.

## Documentation

This README is the quick overview and first-run checklist. For deeper, task-oriented
maintainer documentation — how-to guides, API/schema/config reference, and
architecture/security/privacy explanations — see **[`docs/`](docs/README.md)**.

- New here? Start with [Local development](docs/tutorials/local-development.md)
  then [Production setup](docs/tutorials/production-setup.md).
- Common tasks: [manage challenges](docs/how-to/manage-challenges.md),
  [export leads](docs/how-to/export-and-manage-leads.md),
  [deploy](docs/how-to/deploy.md), [manage secrets](docs/how-to/manage-secrets.md).
- Reference: [API](docs/reference/api.md) ·
  [database schema](docs/reference/database-schema.md) ·
  [configuration](docs/reference/configuration.md).
- Stuck? [Troubleshooting](docs/troubleshooting.md).

## Hosting model

- **Cloudflare infrastructure (Pages + Functions + D1 + Turnstile)** lives in the **Concinnity** Cloudflare account.
- **GitHub repo** lives in the **Concinnity** org and auto-deploys on push to `main`.
- **Domain `tims.org.au`** is managed by TIMS on their own (non-Cloudflare) DNS provider; the `cybersecurity` subdomain is wired to the Concinnity Pages project via a CNAME (see step 6 under "One-time Cloudflare setup" below).

## Architecture

Single Cloudflare Pages project. The static SPA *and* the API/landing/OG routes live in the same deployment, served from one custom domain.

```
┌────────────────────────────────────────────────────────────────────┐
│  Squarespace page (tims.org.au/cybersecurity)                      │
│   └─ Code Block embed snippet → iframe with postMessage resize     │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
┌────────────────────────────────────────────────────────────────────┐
│  Cloudflare Pages — cybersecurity.tims.org.au                      │
│  ├─ Static assets (Vite-built React SPA)                           │
│  └─ Pages Functions (file-based routing):                          │
│      • /api/challenges  → randomised challenge set from D1         │
│      • /api/start       → record challenge start + attribution     │
│      • /api/complete    → record completion, return share/og URLs  │
│      • /api/event       → record course CTA / workshop click       │
│      • /api/lead        → Turnstile-verified participant form      │
│      • /api/share       → record share event                       │
│      • /r/:session_id   → server-rendered share landing + OG meta  │
│      • /og/:session.png → dynamic 1200×630 PNG via satori + resvg  │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
                ┌──────────────────────────┐
                │  Cloudflare D1 (SQLite)  │
                │  challenges · sessions · │
                │  completions · events ·  │
                │  leads · shares          │
                └──────────────────────────┘
```

## Repo layout

```
/
├── frontend/                  # The whole application — SPA + Pages Functions
│   ├── public/assets/         # TIMS + Concinnity logos, favicon
│   ├── src/                   # React SPA
│   │   ├── components/        # Welcome, Challenge, Feedback, Result, LeadForm, ...
│   │   ├── lib/               # api client, attribution, config, types, turnstile, iframe helpers
│   │   ├── styles.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── functions/             # Cloudflare Pages Functions (file-based routing)
│   │   ├── api/
│   │   │   ├── _middleware.ts # CORS for /api/* responses
│   │   │   ├── health.ts
│   │   │   ├── challenges.ts
│   │   │   ├── start.ts
│   │   │   ├── complete.ts
│   │   │   ├── event.ts
│   │   │   ├── lead.ts
│   │   │   └── share.ts
│   │   ├── r/[session_id].ts        # share landing
│   │   ├── og/[session_id].png.ts   # dynamic OG PNG
│   │   └── _shared/                 # cross-function helpers (db, tiers, cors, og, attribution, ...)
│   ├── index.html
│   ├── vite.config.ts
│   ├── wrangler.toml          # D1 binding, env vars
│   ├── .env.example
│   ├── .dev.vars.example
│   └── package.json
├── migrations/
│   ├── 0001_initial.sql       # schema
│   ├── 0002_seed_challenges.sql  # 15 seed challenges with en translations
│   └── 0003_attribution_and_funnel.sql  # sessions + events tables, lead attribution columns
├── embed/
│   ├── embed.js               # drop-in script (alternative installation)
│   └── EMBED_SNIPPET.html     # ★ copy-paste this into Squarespace
├── .github/workflows/deploy.yml
├── _handoff/                  # original Claude Design handoff (reference only)
└── README.md
```

## Prerequisites

- **Node.js 20+** (LTS)
- **npm** (bundled with Node)
- A **Cloudflare account** (Concinnity's) with:
  - Workers & Pages enabled (free tier is fine)
  - D1 enabled
  - Turnstile site + secret keys (free)

> **Note for Windows / OneDrive users:** keep this repo outside any cloud-synced folder. OneDrive on `node_modules` causes sync conflicts. Recommended: `C:\Dev\cybersecurity-champ-tims\`.

## One-time Cloudflare setup

### 1. Install wrangler & log in

```sh
cd frontend
npm install
npx wrangler login   # opens a browser → Allow
```

### 2. Create the D1 database

```sh
cd frontend
npm run db:create
```

Copy the printed `database_id` and paste it into `frontend/wrangler.toml` at `database_id = "…"`.

### 3. Create the Turnstile widget

At <https://dash.cloudflare.com/?to=/:account/turnstile>:
- Widget mode: **Invisible**
- Hostnames: `cybersecurity.tims.org.au`, `tims.org.au`, `www.tims.org.au`
- Save the **site key** and **secret key**.

Put the **site key** in `frontend/wrangler.toml` (`TURNSTILE_SITE_KEY`) and in GitHub Actions vars (see CI section).

After your first Pages deploy (next section), set the secret:

```sh
cd frontend
npx wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend
```

### 4. First deploy + Pages project creation

```sh
cd frontend
npm run deploy
```

The first run creates a Pages project named `cybersecurity-champions-frontend`. Output gives you a `*.pages.dev` URL — test it works.

### 5. Apply schema, seed + migrations to remote D1

```sh
cd frontend
npm run db:remote:init
```

### 6. Attach the custom domain — the tricky bit (cross-DNS)

Because `tims.org.au` is on a non-Cloudflare DNS provider, the wiring is:

**Step A — in the Concinnity Cloudflare dashboard:**
1. Workers & Pages → `cybersecurity-champions-frontend` → Custom domains → **Set up a custom domain**.
2. Enter `cybersecurity.tims.org.au` → Continue.
3. Cloudflare gives you a **CNAME target** like `cybersecurity-champions-frontend.pages.dev`. Note it.

**Step B — at TIMS's DNS provider:**
1. Log into the DNS provider where `tims.org.au` is hosted (TIMS will do this part).
2. Create a new DNS record:
   - **Type:** CNAME
   - **Name / Host:** `cybersecurity`
   - **Value / Target:** `cybersecurity-champions-frontend.pages.dev`
   - **TTL:** automatic / default
3. Save.

**Step C — back in Cloudflare:**
- The custom domain card will detect the CNAME and turn green within a few minutes (TTL-dependent).
- Cloudflare auto-provisions a TLS certificate.

**Verify:**
- <https://cybersecurity.tims.org.au> → welcome screen.
- <https://cybersecurity.tims.org.au/api/health> → `{"ok":true}`.

## Environment variables

### Cloud (Pages project — `frontend/wrangler.toml`)

| Where | Name | Notes |
|---|---|---|
| `[vars]` | `PRIMARY_DOMAIN` | `cybersecurity.tims.org.au` |
| `[vars]` | `EMBED_PARENT_DOMAINS` | `tims.org.au,www.tims.org.au` |
| `[vars]` | `TURNSTILE_SITE_KEY` | public site key (safe to commit) |
| `pages secret put` | `TURNSTILE_SECRET` | secret — never commit |

### Local dev (`.dev.vars` in `frontend/`)

Copy `.dev.vars.example` to `.dev.vars`. Already gitignored. Contains the always-passing Turnstile test secret.

### Frontend build (`.env.local` in `frontend/`)

Copy `.env.example`. Build-time Vite vars — see file for details.

### GitHub Actions

**Secrets** (Settings → Secrets and variables → Actions → Secrets):
- `CLOUDFLARE_API_TOKEN` — token with Pages Edit perms.
- `CLOUDFLARE_ACCOUNT_ID`.

**Variables** (same screen, Variables tab):
- `TURNSTILE_SITE_KEY`, `TRIBAL_HABITS_ENROL_URL`, `WORKSHOP_ENQUIRY_URL`, `SCAMWATCH_SUBSCRIBE_URL`, `PRIMARY_DOMAIN`.

## Local development

One terminal does everything:

```sh
cd frontend
npm install
cp .dev.vars.example .dev.vars
npm run db:local:init
npm run dev
```

`npm run dev` runs `wrangler pages dev` in front of Vite — Vite serves the SPA, wrangler serves the functions, both on the same port (`http://localhost:8788`). Open that URL.

### Reset the local DB
```sh
cd frontend
npm run db:local:reset
```

### Test the OG image locally
With the dev server running, complete a challenge once in the UI, then open:
```
http://localhost:8788/og/<your-session-id>.png
http://localhost:8788/r/<your-session-id>
```

## Production deployment

### Manual (one-time setup)

See "One-time Cloudflare setup" above.

### Subsequent deploys
Push to `main` — `.github/workflows/deploy.yml` builds and deploys. About 90 seconds.

### Running migrations in production
```sh
cd frontend
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0001_initial.sql
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0002_seed_challenges.sql
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_attribution_and_funnel.sql
```

Each file is applied **once**. On an existing database apply only the new file,
and apply it **before** deploying code that depends on it — see
[How-to: Run migrations](docs/how-to/run-migrations.md).

## Installing the Squarespace embed

1. In Squarespace, open the page (`/cybersecurity`).
2. Add a **Code Block** where you want the challenge to appear.
3. Open [`embed/EMBED_SNIPPET.html`](embed/EMBED_SNIPPET.html), copy the entire contents, paste into the Code Block, save.
4. Test in a fresh browser session — the iframe should appear and auto-resize as the user progresses through screens.

The embed sets a `sandbox` attribute with the minimum permissions needed. The postMessage origin check is locked to `https://cybersecurity.tims.org.au`.

The snippet also forwards the host page's `utm_*` parameters and the visitor's referring hostname (`ref`) onto the iframe `src`, so embedded traffic is attributed to its campaign. Point campaign links at the TIMS page (or the standalone URL) with UTMs, e.g. `https://tims.org.au/cybersecurity?utm_source=tims&utm_medium=facebook&utm_campaign=sept-course&utm_content=<publer creative id>`. If the Code Block was pasted before attribution forwarding was added, re-paste it — see [How-to: Update the embed](docs/how-to/update-the-embed.md).

## Content management

### Add a new challenge
Use one of the entries in `migrations/0002_seed_challenges.sql` as a template, then:
```sh
cd frontend
npx wrangler d1 execute cybersecurity-champions-db --remote --file=path/to/new-challenge.sql
```
No code change needed — the next `/api/challenges` call picks it up.

### Retire a challenge
```sh
cd frontend
npx wrangler d1 execute cybersecurity-champions-db --remote --command="UPDATE challenges SET is_active=0 WHERE key='fake_mygov_sms_01';"
```

### Export leads
```sh
cd frontend
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT id, first_name, email, consent_marketing, utm_source, utm_campaign, utm_content, referrer, created_at FROM leads ORDER BY created_at DESC;" --json > leads-export.json
```

### Watch live errors
```sh
cd frontend
npx wrangler pages deployment tail --project-name=cybersecurity-champions-frontend
```

## Funnel and attribution

The result screen shows the score straight away — nothing is gated behind the form. Its primary call to action is the free Tribal Habits course; the participant form (name and email) is optional and sits below it. Each stage is recorded against the `session_id` issued by `/api/challenges`:

| Stage | Recorded by | Table |
|---|---|---|
| Started | `POST /api/start`, when the challenge set loads | `sessions` — one row per attempt, with first-touch UTMs + referrer hostname |
| Completed | `POST /api/complete` | `completions` |
| Course CTA click | `POST /api/event` (`course_cta_click`) | `events` |
| Workshop link click | `POST /api/event` (`workshop_click`) | `events` |
| Left name + email | `POST /api/lead` — a separate measure, not a funnel gate | `leads` |

Everything joins on `session_id`, so every stage can be broken down by `utm_source` / `utm_medium` / `utm_campaign` / `utm_content`. A retake is a new session. Course enrolment happens on Tribal Habits and isn't visible to us — the course CTA click is the last step we can measure.

Concinnity Studio (the internal dashboard) shows the funnel and a by-source breakdown; SQL equivalents are in [How-to: Export and manage leads](docs/how-to/export-and-manage-leads.md).

Still not recorded: per-question progress (where people drop out mid-challenge), IP addresses, and full referrer URLs.

## Out of scope (intentionally)

- No user accounts, login, or password reset.
- No admin UI — content is edited in D1 (dashboard or `wrangler`).
- No email sending — leads are stored; TIMS follows up manually or via export.
- No multilingual content at launch (schema supports it; phase 2 will add).
- No payments, no A/B framework, and no analytics dashboard in this app — reporting lives in Concinnity Studio.

## Troubleshooting

- **"No active challenges" on welcome → start** — run the seed migration; verify with `wrangler d1 execute cybersecurity-champions-db --local --command="SELECT count(*) FROM challenges;"`.
- **Turnstile widget never resolves on the client** — the page's hostname isn't in the widget's allowed list (Cloudflare dashboard → Turnstile → your widget → Settings → Hostname management). In dev, use the always-passing test keys (`1x0000…AA`).
- **`/api/lead` returns 403 with "Turnstile verification failed"** — the `TURNSTILE_SECRET` doesn't match the site key. Double-check you're pasting the **Secret key** value from the Turnstile dashboard, not the Site key (both start `0x4AAAAAAA…` — easy to confuse). Re-set with `wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend` then **redeploy** (see next note).
- **Updated a Pages secret but it didn't take effect** — unlike Workers, Cloudflare **Pages secrets are scoped to a deployment**. Setting a new secret value applies only to *future* deployments. Run `npm run deploy` to push a new deployment that picks it up.
- **OG image returns 500** — first request is slow (loads the Manrope fonts and TIMS logo from same origin). Check `wrangler pages deployment tail --project-name=cybersecurity-champions-frontend` for `OG render failed`. If satori errors with a font-shape error, double-check the TTFs (not WOFF2) are present in `public/fonts/`.
- **Iframe doesn't resize on Squarespace** — open browser devtools, look for blocked postMessage. The embed only accepts messages from `https://cybersecurity.tims.org.au` — make sure the iframe `src` matches.
- **`npm run dev` fails with "wrangler not found"** — run `npm install` in `frontend/`.

## License & credits

Original content and brand assets © TIMS and Concinnity Consulting.

Cybersecurity content references **Scamwatch (ACCC)**, the **NASC**, the **ASD**, **Services Australia**, and **IDCARE**. See the in-app Sources list for full attribution.

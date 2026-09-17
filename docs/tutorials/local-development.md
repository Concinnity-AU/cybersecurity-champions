# Tutorial: Local development

By the end of this tutorial you'll have the full app — React SPA *and*
Cloudflare Pages Functions backed by a local D1 database — running on your
machine at `http://localhost:8788`.

This is the loop you'll use for all day-to-day development. Nothing here touches
production.

## Prerequisites

- **Node.js 20+** (LTS) and **npm** (bundled with Node). Check with `node -v`.
- A clone of this repository.

> **Windows / OneDrive users:** keep the repo outside any cloud-synced folder.
> OneDrive syncing `node_modules` causes conflicts. Use e.g. `C:\Dev\`.

You do **not** need a Cloudflare account to develop locally. Wrangler runs a
local emulator (Miniflare) and a local SQLite database. Turnstile uses the
always-passing test keys in dev.

## Steps

### 1. Install dependencies

```sh
cd frontend
npm install
```

All commands in this tutorial run from the `frontend/` directory.

### 2. Create your local dev secrets file

```sh
cp .dev.vars.example .dev.vars
```

`.dev.vars` holds secrets for the *local* Functions runtime (it's gitignored).
The example file ships the always-passing Turnstile test secret, so lead
submission works locally without a real Cloudflare account. See
[Reference › Configuration](../reference/configuration.md) for what each value
means.

### 3. Initialise the local database

```sh
npm run db:local:init
```

This applies the schema (`migrations/0001_initial.sql`), the seed challenges
(`migrations/0002_seed_challenges.sql`) and the attribution/funnel tables
(`migrations/0003_attribution_and_funnel.sql`) to a local SQLite file that
wrangler manages under `.wrangler/`.

> Already have a local database from before `0003`? Either run
> `npm run db:local:reset`, or apply just the new file:
> `npx wrangler d1 execute cybersecurity-champions-db --local --file=../migrations/0003_attribution_and_funnel.sql`.

### 4. Start the dev server

```sh
npm run dev
```

This runs Vite (serving the SPA, port 5173) and `wrangler pages dev` (serving
the Functions and proxying Vite) concurrently. Open the URL it prints:

```
http://localhost:8788
```

Vite hot-reloads the SPA on save. Changes to files under `functions/` are picked
up by wrangler automatically.

## Verify it works

- `http://localhost:8788` → the welcome screen loads.
- `http://localhost:8788/api/health` → `{"ok":true}`.
- Click **Start** → ten challenges load (this confirms D1 + the seed worked).
- Finish the challenge → the result screen shows your score straight away, with
  the free-course button and the optional updates sign-up below it.

### Test campaign attribution

Open the app with UTMs, e.g.
`http://localhost:8788/?utm_source=test&utm_medium=local&utm_campaign=dev`, play
through, click the course button, then check what was recorded:

```sh
npx wrangler d1 execute cybersecurity-champions-db --local \
  --command="SELECT s.session_id, s.utm_source, s.utm_campaign, e.event_type
               FROM sessions s LEFT JOIN events e ON e.session_id = s.session_id
              ORDER BY s.started_at DESC LIMIT 5;"
```

Attribution is cached per browser tab (`sessionStorage`), so use a new tab when
testing different values without UTMs.

## Common next tasks

### Reset the local database

If you change migrations or want a clean slate:

```sh
npm run db:local:reset
```

This drops every table and re-runs all three migration files.

### Test the share page and OG image locally

Complete a challenge once in the UI to create a `completions` row, then open
(substitute the `session_id` from your run):

```
http://localhost:8788/r/<session-id>        # share landing page
http://localhost:8788/og/<session-id>.png   # 1200×630 social image
```

> The OG image needs the Manrope `.ttf` fonts in `public/fonts/`. They're
> committed, so this should just work. The first render is slow (font load).

### Type-check

```sh
npm run typecheck
```

CI runs this on every push and fails the build on type errors, so run it before
you commit.

## Where to go next

- [Tutorial: Production setup](production-setup.md) — get it live on Cloudflare.
- [Explanation: Architecture](../explanation/architecture.md) — how the pieces
  fit together.
- [Reference: npm scripts](../reference/npm-scripts.md) — every command
  available.

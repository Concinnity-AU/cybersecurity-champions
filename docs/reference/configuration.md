# Reference: Configuration

Every environment variable, secret, and config file the app uses, grouped by
where it lives. There are **four** distinct config surfaces — they're easy to
confuse, so the table headers call out exactly which is which.

## At a glance

| Surface | File / location | Committed? | Used by |
|---|---|---|---|
| Pages runtime vars | `frontend/wrangler.toml` `[vars]` | ✅ yes | Functions at runtime (prod) |
| Pages secret | `wrangler pages secret put` | ❌ no | Functions at runtime (prod) |
| Local Functions vars | `frontend/.dev.vars` | ❌ no (gitignored) | Functions at runtime (local dev) |
| Frontend build vars | `frontend/.env.local` | ❌ no (gitignored) | Vite build → baked into SPA |
| CI build vars/secrets | GitHub Actions settings | ❌ no | `deploy.yml` build & deploy |

---

## 1. Pages runtime — `frontend/wrangler.toml`

Applied to the deployed Functions. The `[vars]` block is **public** (it ships in
the deployment config), so never put secrets here.

```toml
name = "cybersecurity-champions-frontend"
compatibility_date = "2024-11-12"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = "./dist"

[[d1_databases]]
binding = "DB"
database_name = "cybersecurity-champions-db"
database_id = "<from npm run db:create>"

[vars]
PRIMARY_DOMAIN = "cybersecurity.tims.org.au"
EMBED_PARENT_DOMAINS = "tims.org.au,www.tims.org.au"
TURNSTILE_SITE_KEY = "0x4AAAAAA…"   # public site key — safe to commit
```

| Key | Purpose |
|---|---|
| `compatibility_flags = ["nodejs_compat"]` | Required by satori/resvg for OG rendering. |
| `pages_build_output_dir` | Tells wrangler this is a Pages project and where the build output is. |
| `DB` binding | The D1 database, accessed as `env.DB` in Functions. |
| `PRIMARY_DOMAIN` | Used to build `share_url` / `og_image_url` and in CORS/CSP. |
| `EMBED_PARENT_DOMAINS` | Comma-separated extra origins allowed by CORS (the Squarespace parents). |
| `TURNSTILE_SITE_KEY` | Public Turnstile key (also needed at build time via CI). |

## 2. Pages secret — set via wrangler

| Secret | Set with | Purpose |
|---|---|---|
| `TURNSTILE_SECRET` | `wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend` | Turnstile **secret** key; verifies tokens server-side in `/api/lead`. |

> Pages secrets are scoped to a deployment — set, then **redeploy** to apply.
> See [How-to: Manage secrets](../how-to/manage-secrets.md).

The full server-side `Env` interface (`functions/_shared/types.ts`):

```ts
interface Env {
  DB: D1Database;
  TURNSTILE_SECRET: string;
  TURNSTILE_SITE_KEY: string;
  PRIMARY_DOMAIN: string;
  EMBED_PARENT_DOMAINS: string;
}
```

## 3. Local Functions vars — `frontend/.dev.vars`

Copy from `.dev.vars.example`. Gitignored. Provides the same secrets the
Functions need at runtime, but for local `wrangler pages dev`. Ships the
always-passing Turnstile **test secret** (`1x0000000000000000000000000000000AA`)
so lead submission works locally without a real account.

## 4. Frontend build vars — `frontend/.env.local`

Copy from `.env.example`. Gitignored. These are **Vite** vars (prefix
`VITE_`) baked into the SPA at `npm run build`. These baked values are what
production actually uses. (`config.ts` also checks an optional `window.__CONFIG__`
override first, but nothing populates it today — it's a forward-looking hook. See
`frontend/src/lib/config.ts`.)

| Var | Default / example | Purpose |
|---|---|---|
| `VITE_API_BASE` | *(empty)* | API base URL. Leave blank — Functions share the SPA's origin. |
| `VITE_TURNSTILE_SITE_KEY` | `1x00000000000000000000AA` (test) | Public Turnstile site key for the widget. |
| `VITE_TRIBAL_HABITS_ENROL_URL` | Tribal Habits register URL | Enrolment link on the thank-you screen. Supports a `registration_token` query param. |
| `VITE_WORKSHOP_ENQUIRY_URL` | `mailto:connect@tims.org.au…` | Workshop enquiry link. |
| `VITE_SCAMWATCH_SUBSCRIBE_URL` | Scamwatch subscribe URL | "Subscribe to scam alerts" link. |
| `VITE_PRIMARY_DOMAIN` | `cybersecurity.tims.org.au` | Used for share URL construction client-side. |

## 5. CI — GitHub Actions

Set under **Settings → Secrets and variables → Actions** in the GitHub repo.

**Secrets** (Secrets tab):

| Secret | Purpose |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Token with Pages **Edit** permission; used by `wrangler-action`. |
| `CLOUDFLARE_ACCOUNT_ID` | The Concinnity account ID. |

**Variables** (Variables tab) — these feed the Vite build in `deploy.yml`:

| Variable | Purpose |
|---|---|
| `TURNSTILE_SITE_KEY` | Baked into the SPA build. |
| `TRIBAL_HABITS_ENROL_URL` | → `VITE_TRIBAL_HABITS_ENROL_URL` |
| `WORKSHOP_ENQUIRY_URL` | → `VITE_WORKSHOP_ENQUIRY_URL` |
| `SCAMWATCH_SUBSCRIBE_URL` | → `VITE_SCAMWATCH_SUBSCRIBE_URL` |
| `PRIMARY_DOMAIN` | → `VITE_PRIMARY_DOMAIN` |

See [How-to: Deploy](../how-to/deploy.md) for how these flow through the
workflow.

## Test keys (for local dev)

Turnstile publishes always-passing/failing test keys. The repo defaults use the
passing ones:

- Site key (passes any token): `1x00000000000000000000AA`
- Secret key (passes any token): `1x0000000000000000000000000000000AA`

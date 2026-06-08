# Tutorial: Production setup

This walks you through standing up the app in production for the first time:
creating the Cloudflare resources, deploying, seeding the live database, and
wiring the custom domain.

You only do this **once**. After it's set up, routine deploys are automatic on
push to `main` (see [How-to: Deploy](../how-to/deploy.md)).

## Prerequisites

- You've completed [Tutorial: Local development](local-development.md) (or at
  least run `npm install` in `frontend/`).
- Access to the **Concinnity** Cloudflare account with Workers & Pages and D1
  enabled (free tier is fine).
- The ability to add a DNS record for `tims.org.au` (TIMS controls this — see
  step 6).

All commands run from `frontend/`.

## The hosting model in one paragraph

A single Cloudflare Pages project serves both the static SPA and the API /
landing / OG routes from one custom domain (`cybersecurity.tims.org.au`). The
Cloudflare resources live in Concinnity's account; the domain is managed by TIMS
on a non-Cloudflare DNS provider and pointed at the Pages project via a CNAME.
See [Explanation: Architecture](../explanation/architecture.md) for the full
picture.

## Steps

### 1. Log in to wrangler

```sh
npx wrangler login   # opens a browser → Allow
```

### 2. Create the D1 database

```sh
npm run db:create
```

Copy the printed `database_id` into `frontend/wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "cybersecurity-champions-db"
database_id = "<paste-the-id-here>"
```

### 3. Create the Turnstile widget

At <https://dash.cloudflare.com/?to=/:account/turnstile>:

- **Widget mode:** Invisible
- **Hostnames:** `cybersecurity.tims.org.au`, `tims.org.au`, `www.tims.org.au`
- Save the **site key** and the **secret key**.

Put the **site key** in:

- `frontend/wrangler.toml` → `[vars] TURNSTILE_SITE_KEY`
- GitHub Actions → Variables → `TURNSTILE_SITE_KEY` (for the build; see
  [How-to: Deploy](../how-to/deploy.md))

The **secret key** is set after the first deploy (step 5).

### 4. First deploy (creates the Pages project)

```sh
npm run deploy
```

The first run creates a Pages project named
`cybersecurity-champions-frontend` and prints a `*.pages.dev` URL. Open it — the
welcome screen should load (the API will error until you seed the DB in step
6).

### 5. Set the Turnstile secret

```sh
npx wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend
```

Paste the **secret key** when prompted.

> **Important:** Pages secrets are scoped to a *deployment*. A newly set secret
> only applies to *future* deployments. Run `npm run deploy` again after
> setting it. See [How-to: Manage secrets](../how-to/manage-secrets.md).

### 6. Seed the production database

```sh
npm run db:remote:init
```

This applies the schema and seed challenges to the remote D1. After this,
`/api/challenges` returns data.

### 7. Attach the custom domain (cross-DNS — the tricky bit)

Because `tims.org.au` is **not** on Cloudflare DNS, the wiring spans two
dashboards.

**A. In the Concinnity Cloudflare dashboard:**

1. Workers & Pages → `cybersecurity-champions-frontend` → Custom domains →
   **Set up a custom domain**.
2. Enter `cybersecurity.tims.org.au` → Continue.
3. Cloudflare gives you a **CNAME target** like
   `cybersecurity-champions-frontend.pages.dev`. Note it.

**B. At TIMS's DNS provider** (TIMS does this part):

Create a DNS record:

| Field | Value |
|---|---|
| Type | `CNAME` |
| Name / Host | `cybersecurity` |
| Value / Target | `cybersecurity-champions-frontend.pages.dev` |
| TTL | automatic / default |

**C. Back in Cloudflare:**

The custom domain card detects the CNAME and turns green within a few minutes
(TTL-dependent). Cloudflare auto-provisions a TLS certificate.

## Verify it works

- <https://cybersecurity.tims.org.au> → welcome screen.
- <https://cybersecurity.tims.org.au/api/health> → `{"ok":true}`.
- Complete a challenge → the result screen shows a tier and share buttons.

## Where to go next

- [How-to: Deploy](../how-to/deploy.md) — routine deploys from here on.
- [How-to: Update the embed](../how-to/update-the-embed.md) — install the
  challenge on the Squarespace page.
- [Reference: Configuration](../reference/configuration.md) — every env var and
  secret in one place.
</content>

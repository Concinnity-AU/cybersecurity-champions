# How-to: Manage secrets

The app has a small number of secrets. This guide covers setting and rotating
them. For the full configuration map (including non-secret vars), see
[Reference: Configuration](../reference/configuration.md).

## The secrets

| Secret | Lives in | Used for |
|---|---|---|
| `TURNSTILE_SECRET` | Cloudflare Pages secret | Server-side verification of Turnstile tokens in `/api/lead`. |
| `CLOUDFLARE_API_TOKEN` | GitHub Actions secret | Lets CI deploy to Pages. |
| `CLOUDFLARE_ACCOUNT_ID` | GitHub Actions secret | Identifies the Cloudflare account for CI. |

The Turnstile **site key** is *not* a secret — it's public and committed in
`wrangler.toml` / set as a CI Variable.

## Set or rotate the Turnstile secret

```sh
cd frontend
npx wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend
# paste the secret key when prompted
```

> **Critical gotcha:** Cloudflare **Pages secrets are scoped to a deployment.**
> Setting a new value applies only to *future* deployments — the currently-live
> deployment keeps the old value. **You must redeploy** for the change to take
> effect:
>
> ```sh
> npm run deploy
> ```
>
> (or push to `main` / re-run the deploy workflow).

To rotate: generate a new secret key in the Turnstile dashboard, run the
`secret put` command with the new value, redeploy, then confirm lead submission
works before removing the old key from Cloudflare.

> The Turnstile **site key** and **secret key** both start with similar prefixes
> (`0x4AAAAAAA…`) — it's easy to paste the wrong one. The site key goes in
> `wrangler.toml`; the secret key goes in `secret put`. A 403 "Turnstile
> verification failed" on `/api/lead` usually means they're mismatched.

## List / delete Pages secrets

```sh
npx wrangler pages secret list --project-name=cybersecurity-champions-frontend
npx wrangler pages secret delete TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend
```

## Rotate the Cloudflare API token

1. In the Cloudflare dashboard, create a new API token with **Pages: Edit**
   permission (scoped to the Concinnity account).
2. In GitHub → Settings → Secrets and variables → Actions → Secrets, update
   `CLOUDFLARE_API_TOKEN`.
3. Re-run the deploy workflow to confirm it still deploys.
4. Revoke the old token in Cloudflare.

## Local development secrets

Local dev uses `frontend/.dev.vars` (gitignored), which ships the always-passing
Turnstile **test** secret — you don't need the real secret to develop. See
[Reference: Configuration](../reference/configuration.md).
</content>

# Troubleshooting

Symptoms, causes, and fixes for the problems you're most likely to hit. To watch
live logs while reproducing, see
[How-to: Monitor and debug](how-to/monitor-and-debug.md). All `wrangler`
commands run from `frontend/`.

---

## "No active challenges" on welcome → start

**Cause:** the database has no active challenges (seed not applied, or all
retired).

**Fix:** run the seed, then verify:

```sh
# local
npm run db:local:init
# production
npm run db:remote:init

npx wrangler d1 execute cybersecurity-champions-db --local \
  --command="SELECT count(*) FROM challenges WHERE is_active=1;"
```

The API returns `503 No active challenges available` in this state.

---

## Turnstile widget never resolves on the client

**Cause:** the page's hostname isn't in the Turnstile widget's allowed list.

**Fix:** Cloudflare dashboard → Turnstile → your widget → Settings → Hostname
management. Add the hostname. In dev, use the always-passing test keys
(`1x00000000000000000000AA` site / `1x0000000000000000000000000000000AA`
secret).

---

## `/api/lead` returns 403 "Turnstile verification failed"

**Cause:** the `TURNSTILE_SECRET` doesn't match the site key — usually the site
key got pasted where the secret should be (both start `0x4AAAAAAA…`).

**Fix:** re-set the **Secret key** value, then **redeploy** (secrets are
deployment-scoped):

```sh
npx wrangler pages secret put TURNSTILE_SECRET --project-name=cybersecurity-champions-frontend
npm run deploy
```

Tail logs to see the exact reason — `turnstile.ts` logs `error-codes` from
siteverify. See [How-to: Manage secrets](how-to/manage-secrets.md).

---

## Updated a Pages secret but it didn't take effect

**Cause:** Cloudflare **Pages secrets are scoped to a deployment.** A new value
only applies to *future* deployments; the live one keeps the old value.

**Fix:** trigger a new deployment:

```sh
npm run deploy   # or push to main / re-run the deploy workflow
```

---

## OG image returns 500

**Cause:** the `/og/:id.png` render threw. Most common: missing or wrong font
files (satori needs the Manrope **`.ttf`** files — not WOFF2 — in
`public/fonts/`). The first request is also slow (loads fonts + logo).

**Fix:** check logs for `OG render failed`:

```sh
npx wrangler pages deployment tail --project-name=cybersecurity-champions-frontend
```

Confirm `public/fonts/Manrope-*.ttf` exist and are committed. If satori reports a
font-shape error, you've likely got a WOFF2 where a TTF should be.

---

## Iframe doesn't resize on Squarespace

**Cause:** postMessage from the app is being blocked or ignored — usually an
origin mismatch.

**Fix:** open browser devtools, look for blocked postMessage. The embed only
accepts messages from `https://cybersecurity.tims.org.au`; make sure the iframe
`src` (and `EMBED_ORIGIN` in the snippet) matches that origin exactly. Re-paste
the snippet into the Squarespace Code Block if you changed it. See
[How-to: Update the embed](how-to/update-the-embed.md).

---

## `npm run dev` fails with "wrangler not found"

**Cause:** dependencies aren't installed.

**Fix:**

```sh
cd frontend
npm install
```

---

## CORS error calling the API from the embedded page

**Cause:** the requesting origin isn't in the allowlist.

**Fix:** the parent origin must be one of: `tims.org.au`, `www.tims.org.au`,
`PRIMARY_DOMAIN`, `localhost`, or a host listed in `EMBED_PARENT_DOMAINS`. Add
the origin to `EMBED_PARENT_DOMAINS` in `wrangler.toml` and redeploy. See
[Explanation: Security](explanation/security.md).

---

## CI deploy fails at the Typecheck step

**Cause:** a TypeScript error (`npm run typecheck` fails the build before
deploy).

**Fix:** reproduce and fix locally:

```sh
cd frontend
npm run typecheck
```

---

## CI deploy fails at the Deploy step (auth)

**Cause:** invalid/expired `CLOUDFLARE_API_TOKEN`, or wrong
`CLOUDFLARE_ACCOUNT_ID`.

**Fix:** rotate/refresh the token (Pages: Edit permission) and update the GitHub
Actions secrets. See [How-to: Manage secrets](how-to/manage-secrets.md).

---

## Custom domain card won't go green

**Cause:** the CNAME at TIMS's DNS provider isn't resolving to the Pages target
yet (propagation/TTL), or the record is wrong.

**Fix:** confirm the `cybersecurity` CNAME points at
`cybersecurity-champions-frontend.pages.dev`, then wait out the TTL. See
[Tutorial: Production setup](tutorials/production-setup.md).

```sh
# check what the subdomain resolves to
nslookup cybersecurity.tims.org.au
```
</content>

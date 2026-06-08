# How-to: Deploy

There are two ways to deploy: **automatic** (push to `main`, the normal path)
and **manual** (wrangler from your machine, for one-offs).

First-time setup (creating the Pages project, D1, domain) is a separate,
one-time process — see [Tutorial: Production setup](../tutorials/production-setup.md).

## Automatic deploy (the normal path)

Push to `main`. The workflow `.github/workflows/deploy.yml` builds and deploys to
Cloudflare Pages. Takes ~90 seconds.

```sh
git switch main
git pull
# merge your work into main, then:
git push
```

What the workflow does:

1. Checks out the repo and sets up Node 20 with npm cache.
2. `npm ci` in `frontend/`.
3. `npm run typecheck` — **fails the build on type errors**.
4. `npm run build` with the `VITE_*` build vars injected from GitHub Actions
   **Variables**.
5. Deploys `dist/` to the `cybersecurity-champions-frontend` Pages project on
   the `main` branch, authenticating with the `CLOUDFLARE_API_TOKEN` /
   `CLOUDFLARE_ACCOUNT_ID` **Secrets**.

`workflow_dispatch` is enabled, so you can also trigger it manually from the
GitHub Actions tab without a new commit.

> Concurrency is set to **not** cancel in-progress deploys
> (`cancel-in-progress: false`), so overlapping pushes queue rather than abort
> mid-deploy.

The build vars and secrets are listed in
[Reference: Configuration](../reference/configuration.md).

## Manual deploy (one-off)

From your machine, when you need to push a build without going through CI:

```sh
cd frontend
npm run deploy   # = npm run build && wrangler pages deploy dist --project-name=cybersecurity-champions-frontend
```

You must be logged in (`npx wrangler login`). Note that a manual `npm run build`
uses your **local** `.env.local` vars, not the CI Variables — so prefer CI for
anything that needs the canonical production build vars.

## When you must redeploy even without code changes

Cloudflare **Pages secrets are scoped to a deployment**. If you change
`TURNSTILE_SECRET` (or any secret), it only takes effect on the *next*
deployment. After setting a secret, trigger a deploy (push, re-run the workflow,
or `npm run deploy`). See [How-to: Manage secrets](../how-to/manage-secrets.md).

## Verify a deploy

```
https://cybersecurity.tims.org.au/api/health   → {"ok":true}
```

Then load the site and complete a challenge. To watch for runtime errors live,
see [How-to: Monitor and debug](monitor-and-debug.md).

## Rolling back

In the Cloudflare dashboard → Workers & Pages → `cybersecurity-champions-frontend`
→ Deployments, you can promote a previous deployment to roll back the SPA +
Functions quickly. Note this does **not** roll back database changes — handle
those separately via a corrective migration.
</content>

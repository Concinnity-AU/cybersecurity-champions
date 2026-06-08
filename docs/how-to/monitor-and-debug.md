# How-to: Monitor and debug

Tools for watching the live app and reproducing issues. All commands run from
`frontend/`.

## Tail live logs (production)

Stream real-time logs (including `console.*` from Functions and uncaught
errors):

```sh
npx wrangler pages deployment tail --project-name=cybersecurity-champions-frontend
```

Leave this running while you reproduce an issue in the browser. Useful markers
to grep for:

- `OG render failed` — the OG image route threw (usually a font problem).
- `Turnstile: …` — Turnstile verification warnings from `/api/lead`
  (`no token`, `siteverify rejected`, `error-codes`, empty secret).

## Health check

```sh
curl https://cybersecurity.tims.org.au/api/health
# {"ok":true}
```

## Test the share landing page and OG image

These are the routes social platforms hit. Test with a real `session_id` from a
completed run:

```
https://cybersecurity.tims.org.au/r/<session-id>        # HTML share page
https://cybersecurity.tims.org.au/og/<session-id>.png   # 1200×630 PNG
```

- A session that doesn't exist still renders — `/r/` shows generic copy, `/og/`
  renders a generic 10/10 "champion" card.
- The OG image is cached `immutable` for a year, so a given session's image
  won't change once generated.

Validate the rich preview with the platforms' own inspectors:

- Facebook Sharing Debugger
- LinkedIn Post Inspector
- Twitter/X Card Validator

## Debug locally

The fastest debug loop is local. Reproduce against the local stack:

```sh
npm run dev
# app:        http://localhost:8788
# health:     http://localhost:8788/api/health
# share page: http://localhost:8788/r/<session-id>
# OG image:   http://localhost:8788/og/<session-id>.png
```

`console.*` from Functions prints in the terminal running `npm run dev`. SPA
logs go to the browser console.

Inspect local data directly:

```sh
npx wrangler d1 execute cybersecurity-champions-db --local \
  --command="SELECT session_id, score, tier, completed_at FROM completions ORDER BY completed_at DESC LIMIT 5;"
```

## Check CI / build status

Build or typecheck failures surface in the GitHub Actions tab (the `Deploy`
workflow). The `Typecheck` step fails the build before deploy on any TS error —
run `npm run typecheck` locally to reproduce.

## Common issues

For specific symptoms (no challenges, Turnstile failures, OG 500s, iframe not
resizing, secret not taking effect), see [Troubleshooting](../troubleshooting.md).

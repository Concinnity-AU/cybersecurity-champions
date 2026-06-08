# Reference: npm scripts

All scripts are defined in `frontend/package.json` and run from the `frontend/`
directory.

## Development

| Script | Command | What it does |
|---|---|---|
| `npm run dev` | concurrently runs `dev:vite` + `dev:wrangler` | The main dev loop. Vite serves the SPA; wrangler serves Functions and proxies Vite. Open `http://localhost:8788`. |
| `npm run dev:vite` | `vite` | SPA only, on port 5173. Rarely run directly. |
| `npm run dev:wrangler` | waits for port 5173, then `wrangler pages dev --proxy 5173 --port 8788` | Functions runtime in front of Vite. Rarely run directly. |

## Build & deploy

| Script | Command | What it does |
|---|---|---|
| `npm run build` | `vite build` | Production SPA build → `dist/`. |
| `npm run preview` | `vite preview` | Serve the built `dist/` locally to sanity-check the build. |
| `npm run typecheck` | `tsc --noEmit` | Type-check only. CI runs this and fails on errors — run before committing. |
| `npm run deploy` | `build` then `wrangler pages deploy dist --project-name=cybersecurity-champions-frontend` | Manual build + deploy. Routine deploys happen via CI on push to `main`. |

## Database

All D1 scripts target the database named `cybersecurity-champions-db`.

| Script | Target | What it does |
|---|---|---|
| `npm run db:create` | — | Creates the D1 database. **One-time.** Copy the printed `database_id` into `wrangler.toml`. |
| `npm run db:local:init` | local | Applies schema (`0001`) + seed (`0002`) to the local SQLite DB. |
| `npm run db:local:reset` | local | Drops all tables, then re-runs `db:local:init`. Clean slate for dev. |
| `npm run db:remote:init` | **remote** | Applies schema + seed to **production** D1. Used during first setup. |

> `db:local:reset` drops `shares`, `completions`, `leads`,
> `challenge_translations`, and `challenges`. It's local-only — there is no
> remote reset script by design (so you can't wipe production by reflex).

## Running ad-hoc D1 commands

For anything not covered by a script, call wrangler directly:

```sh
# apply a single migration file to production
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_my_change.sql

# run a one-off query locally
npx wrangler d1 execute cybersecurity-champions-db --local --command="SELECT count(*) FROM leads;"
```

See [How-to: Run migrations](../how-to/run-migrations.md).
</content>

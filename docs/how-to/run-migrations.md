# How-to: Run migrations

Migrations are plain `.sql` files in the top-level `migrations/` directory,
applied with `wrangler d1 execute`. There's no migration framework — files are
numbered and applied in order, and you track what's been applied.

Existing files:

| File | Purpose |
|---|---|
| `0001_initial.sql` | Schema: all tables and indexes. |
| `0002_seed_challenges.sql` | Seed: challenges + `en` translations. |
| `0003_attribution_and_funnel.sql` | Adds `sessions` and `events` tables; adds `session_id`, `utm_content`, `referrer` to `leads`; new indexes. **Apply once** — its `ALTER TABLE ADD COLUMN` statements fail if re-run. |

All commands run from `frontend/`.

## Apply `0003` to production (existing database)

The quiz code that records starts, click events and attributed sign-ups depends
on `0003`, and so does Concinnity Studio (its analytics, sessions list and
completions list query the new tables). Apply it to production **once**, and
**before** deploying either the quiz or Studio:

```sh
# 1. local — then run the app and check a start, a course click and a sign-up
npx wrangler d1 execute cybersecurity-champions-db --local --file=../migrations/0003_attribution_and_funnel.sql

# 2. remote (production) — before pushing the quiz code to main
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_attribution_and_funnel.sql
```

If the quiz is deployed without it, `/api/start` and `/api/event` error (they're
fire-and-forget, so users don't notice, but nothing is recorded) and
**`/api/lead` fails** — sign-ups are lost. The migration is additive, so it's
safe to apply while the current quiz is live.

Check it's applied (you should see `session_id`, `utm_content` and `referrer`):

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT name FROM pragma_table_info('leads');"
```

## Golden rule: local first

Always apply and test a migration against the **local** database before the
**remote** one. There's no undo on production.

```sh
# 1. local
npx wrangler d1 execute cybersecurity-champions-db --local --file=../migrations/0004_my_change.sql
npm run dev   # verify behaviour

# 2. remote (production)
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0004_my_change.sql
```

## Initialise a database from scratch

Convenience scripts apply `0001`, `0002` and `0003` in order, in one go. Use them
only on an **empty** database — on an existing one, apply just the files it's
missing.

```sh
npm run db:local:init     # local
npm run db:remote:init    # production (used during first setup)
```

## Reset the local database

Drops every table and re-applies schema + seed. **Local only.**

```sh
npm run db:local:reset
```

There is intentionally no remote reset script — see
[Reference: npm scripts](../reference/npm-scripts.md).

## Writing a new migration

1. Create the next numbered file, e.g. `migrations/0004_add_column.sql`.
2. Write idempotent-ish SQL where you can (`CREATE TABLE IF NOT EXISTS`,
   guarded updates) so re-running is safe. `ALTER TABLE … ADD COLUMN` can't be
   guarded in SQLite — note in the file header that it must be applied once.
3. Apply local → test → apply remote, **before** deploying code that depends on
   it.
4. Add the file to the `db:local:init` / `db:remote:init` scripts (and any new
   tables to the `DROP` list in `db:local:reset`) in `frontend/package.json`.
5. **Commit the file.** The `migrations/` directory is the source of truth for
   rebuilding any database.
6. Concinnity Studio keeps a copy of these migrations (under
   `migrations/tims-cyber/`) for its local database — copy the new file there
   too, and update Studio if it should show the change.

> D1 is SQLite, so `ALTER TABLE` is limited (you can add columns, but not drop or
> heavily modify them in one statement). For complex table changes, the SQLite
> pattern is: create a new table, copy data across, drop the old, rename. Test
> that locally carefully.

## Apply a single migration manually

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0001_initial.sql
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0002_seed_challenges.sql
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_attribution_and_funnel.sql
```

## Verify

```sh
# list tables
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

# spot-check row counts
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT count(*) FROM challenges;"
```

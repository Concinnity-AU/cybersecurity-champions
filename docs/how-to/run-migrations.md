# How-to: Run migrations

Migrations are plain `.sql` files in the top-level `migrations/` directory,
applied with `wrangler d1 execute`. There's no migration framework — files are
numbered and applied in order, and you track what's been applied.

Existing files:

| File | Purpose |
|---|---|
| `0001_initial.sql` | Schema: all tables and indexes. |
| `0002_seed_challenges.sql` | Seed: challenges + `en` translations. |

All commands run from `frontend/`.

## Golden rule: local first

Always apply and test a migration against the **local** database before the
**remote** one. There's no undo on production.

```sh
# 1. local
npx wrangler d1 execute cybersecurity-champions-db --local --file=../migrations/0003_my_change.sql
npm run dev   # verify behaviour

# 2. remote (production)
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_my_change.sql
```

## Initialise a database from scratch

Convenience scripts apply `0001` then `0002` in one go:

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

1. Create the next numbered file, e.g. `migrations/0003_add_column.sql`.
2. Write idempotent-ish SQL where you can (`CREATE TABLE IF NOT EXISTS`,
   guarded updates) so re-running is safe.
3. Apply local → test → apply remote.
4. **Commit the file.** The `migrations/` directory is the source of truth for
   rebuilding any database.

> D1 is SQLite, so `ALTER TABLE` is limited (you can add columns, but not drop or
> heavily modify them in one statement). For complex table changes, the SQLite
> pattern is: create a new table, copy data across, drop the old, rename. Test
> that locally carefully.

## Apply a single migration manually

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0001_initial.sql
npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0002_seed_challenges.sql
```

## Verify

```sh
# list tables
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT name FROM sqlite_master WHERE type='table';"

# spot-check row counts
npx wrangler d1 execute cybersecurity-champions-db --remote --command="SELECT count(*) FROM challenges;"
```

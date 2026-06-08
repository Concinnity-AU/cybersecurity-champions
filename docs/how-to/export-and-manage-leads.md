# How-to: Export and manage leads

Leads are captured by `POST /api/lead` into the `leads` table and linked to a
completion via `lead_id`. There's no admin UI — you query D1 directly with
wrangler. All commands run from `frontend/`.

Table shape: [Reference: Database schema](../reference/database-schema.md).
Privacy context: [Explanation: Privacy and data](../explanation/privacy-and-data.md).

## Export all leads to a file

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT id, first_name, email, phone, postcode, consent_program,
                    consent_marketing, utm_source, utm_medium, utm_campaign, created_at
               FROM leads ORDER BY created_at DESC;" \
  --json > leads-export.json
```

`--json` gives a machine-readable file you can import into a spreadsheet or CRM.
Drop `--json` for a readable table in the terminal.

> `leads-export.json` contains PII. Keep it out of the repo (it's not gitignored
> by default — don't commit it), store it securely, and delete it when done.

## Export only marketing-consented leads

> **Note:** the current launch form does **not** collect marketing consent —
> every lead is stored with `consent_marketing = 0`, so this query returns
> **nothing** today. It becomes useful only once a marketing opt-in checkbox is
> added to the form (see
> [Explanation: Privacy and data](../explanation/privacy-and-data.md#consent-model)).

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT first_name, email, phone FROM leads WHERE consent_marketing=1 ORDER BY created_at DESC;" \
  --json > marketing-leads.json
```

## Leads with their quiz result

Join `leads` to `completions` to see how each lead scored:

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT l.first_name, l.email, c.score, c.total, c.tier, c.completed_at
               FROM leads l JOIN completions c ON c.lead_id = l.id
              ORDER BY c.completed_at DESC;" --json > leads-with-results.json
```

## Count leads over a period

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT date(created_at) AS day, count(*) AS leads
               FROM leads GROUP BY day ORDER BY day DESC;"
```

## Basic completion / share analytics

```sh
# completions by tier
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT tier, count(*) FROM completions GROUP BY tier;"

# shares by platform
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT platform, count(*) FROM shares GROUP BY platform ORDER BY 2 DESC;"

# conversion: completions that became leads
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT
               count(*) AS completions,
               sum(CASE WHEN lead_id IS NOT NULL THEN 1 ELSE 0 END) AS leads
             FROM completions;"
```

## Deleting a lead (right-to-erasure request)

If someone asks to be removed:

```sh
# find them first
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT id, first_name, email FROM leads WHERE email='person@example.com';"

# unlink from completions, then delete the lead row
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="UPDATE completions SET lead_id=NULL WHERE lead_id=<id>;"
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="DELETE FROM leads WHERE id=<id>;"
```

The completion row stays (it's anonymous once unlinked), so your analytics
aren't skewed.

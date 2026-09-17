# How-to: Export and manage leads

Leads are captured by `POST /api/lead` (the optional "updates and resources"
sign-up on the result screen) into the `leads` table. Each lead stores its
`session_id` and campaign attribution, and is linked from its completion via
`lead_id`.

This app has no admin UI. For browsing, filtering and CSV export, use
**Concinnity Studio** (the internal read-only dashboard over the same D1) — it
lists leads, sessions and completions with their source, and its Analytics page
shows the start → complete → course-click funnel and a by-source table. For
anything else, query D1 directly with wrangler as below. All commands run from
`frontend/`.

Table shape: [Reference: Database schema](../reference/database-schema.md).
Privacy context: [Explanation: Privacy and data](../explanation/privacy-and-data.md).

## Export all leads to a file

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT id, first_name, email, phone, postcode, consent_program,
                    consent_marketing, utm_source, utm_medium, utm_campaign,
                    utm_content, referrer, session_id, created_at
               FROM leads ORDER BY created_at DESC;" \
  --json > leads-export.json
```

`--json` gives a machine-readable file you can import into a spreadsheet or CRM.
Drop `--json` for a readable table in the terminal.

> `leads-export.json` contains PII. Keep it out of the repo (it's not gitignored
> by default — don't commit it), store it securely, and delete it when done.

## Export only marketing-consented leads

> **Note:** the current form's single checkbox covers updates and resources, so
> every lead it submits has `consent_marketing = 1`. Leads captured by the
> earlier launch form have `consent_marketing = 0` and are excluded here (see
> [Explanation: Privacy and data](../explanation/privacy-and-data.md#consent-model)).

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT first_name, email, created_at FROM leads WHERE consent_marketing=1 ORDER BY created_at DESC;" \
  --json > marketing-leads.json
```

## Leads with their quiz result

Join `leads` to `completions` to see how each lead scored (a lead whose
completion wasn't recorded won't appear):

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

# completions that also signed up for updates
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT
               count(*) AS completions,
               sum(CASE WHEN lead_id IS NOT NULL THEN 1 ELSE 0 END) AS leads
             FROM completions;"
```

## Funnel by source

Every stage joins to `sessions` on `session_id`. Sessions only exist from
migration `0003` onwards, so older completions and leads don't appear here.
Counts are distinct sessions (attempts — a retake is a new session). Leads are a
separate measure, not a step after the course click.

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT COALESCE(s.utm_source, s.referrer, '(direct)') AS source,
                    s.utm_medium AS medium, s.utm_campaign AS campaign,
                    s.utm_content AS creative,
                    count(DISTINCT s.session_id) AS started,
                    count(DISTINCT c.session_id) AS completed,
                    count(DISTINCT e.session_id) AS course_clicks,
                    count(DISTINCT l.session_id) AS leads
               FROM sessions s
               LEFT JOIN completions c ON c.session_id = s.session_id
               LEFT JOIN events e ON e.session_id = s.session_id
                                 AND e.event_type = 'course_cta_click'
               LEFT JOIN leads l ON l.session_id = s.session_id
              WHERE s.started_at >= datetime('now', '-90 days')
              GROUP BY 1, 2, 3, 4
              ORDER BY started DESC;"
```

`source` falls back to the referring hostname, then `(direct)`, when there's no
`utm_source`. Course enrolment happens on Tribal Habits and isn't visible here —
`course_clicks` is the last stage we can measure. Swap `'course_cta_click'` for
`'workshop_click'` to count workshop-link clicks instead.

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

Deleting the lead row is all that's needed. The completion, session, event and
share rows stay — they hold no personal data, and nothing links them to the
person once the lead is gone — so your analytics aren't skewed.

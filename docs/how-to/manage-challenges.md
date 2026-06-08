# How-to: Manage challenges

Add, edit, and retire quiz challenges. Challenges live in the D1 database, not in
code — so most changes need **no deploy**. The next `/api/challenges` call picks
them up.

Background on types and selection: [Reference: Challenge system](../reference/challenge-system.md).
Table shapes: [Reference: Database schema](../reference/database-schema.md).

All commands run from `frontend/`.

## Add a new challenge

A challenge is two inserts: one into `challenges`, one into
`challenge_translations` (for each language — currently just `en`).

1. Use an existing entry in `migrations/0002_seed_challenges.sql` as a template.
2. Create a new `.sql` file (e.g. `migrations/0003_add_new_challenge.sql`) with
   both inserts. Pattern:

   ```sql
   INSERT INTO challenges (key, type, category, difficulty, correct_answer, metadata, source_note)
   VALUES ('unique_key_01', 'spot_it', 'phishing', 2, 'scam',
           '{"...type-specific JSON..."}',
           'Based on a scam reported to Scamwatch, 2025.');

   INSERT INTO challenge_translations (challenge_id, language_code, prompt, options, explanation)
   VALUES ((SELECT id FROM challenges WHERE key='unique_key_01'), 'en',
           'The question text…',
           '["option a","option b"]',
           'Why the answer is what it is.');
   ```

   - `key` must be **unique** and stable.
   - `type` must be one of `spot_it`, `pick_stronger`, `scenario`, `real_ai`.
   - `difficulty` is 1–3.
   - The `options`/`metadata` JSON shape depends on `type` — copy the shape from
     an existing challenge of the same type.

3. Apply it:

   ```sh
   # local first, to test
   npx wrangler d1 execute cybersecurity-champions-db --local --file=../migrations/0003_add_new_challenge.sql
   npm run dev   # play through and verify it appears and reads correctly

   # then production
   npx wrangler d1 execute cybersecurity-champions-db --remote --file=../migrations/0003_add_new_challenge.sql
   ```

> Keep each change as a numbered file in `migrations/` even though it's data, not
> schema — it gives you a replayable history and makes rebuilding a database
> trivial. Commit the file.

## Edit an existing challenge

Update the rows in place. To fix the wording of a prompt:

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="UPDATE challenge_translations
                SET prompt='Corrected text'
              WHERE challenge_id=(SELECT id FROM challenges WHERE key='unique_key_01')
                AND language_code='en';"
```

To change the correct answer or difficulty, update the `challenges` row:

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="UPDATE challenges SET correct_answer='legit', difficulty=3 WHERE key='unique_key_01';"
```

Test the same change `--local` first.

## Retire a challenge

Don't delete — set `is_active = 0`. It stops being served but its historical
completions still reference it cleanly.

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="UPDATE challenges SET is_active=0 WHERE key='fake_mygov_sms_01';"
```

Reactivate by setting it back to `1`.

## Verify the active pool

```sh
npx wrangler d1 execute cybersecurity-champions-db --remote \
  --command="SELECT type, count(*) FROM challenges WHERE is_active=1 GROUP BY type;"
```

Check you still have enough of each type to satisfy the selection distribution
(4 `spot_it`, 2 `pick_stronger`, 3 `scenario`, 1 `real_ai` for a 10-question
quiz). The selector degrades gracefully if a bucket is short, but you'll get a
less balanced quiz.
</content>

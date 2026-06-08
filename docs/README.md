# Maintainer documentation

Technical documentation and how-to guides for maintaining the **Cybersecurity
Champions Challenge**. The top-level [`README.md`](../README.md) is the quick
overview and first-run checklist; this folder is the deeper, canonical
reference.

## How this is organised

These docs follow the [Diátaxis](https://diataxis.fr/) framework — content is
split by what you're trying to do:

| Section | When to read it |
|---|---|
| **[Tutorials](#tutorials)** | You're starting from zero and want a guided, end-to-end walkthrough. |
| **[How-to guides](#how-to-guides)** | You have a specific task to get done and want the recipe. |
| **[Reference](#reference)** | You need exact facts: endpoints, columns, env var names, scripts. |
| **[Explanation](#explanation)** | You want to understand *why* the system is built the way it is. |

If you're brand new, read the two tutorials in order, then skim
[Explanation › Architecture](explanation/architecture.md).

## Tutorials

Learning-oriented, start-to-finish walkthroughs.

- **[Local development](tutorials/local-development.md)** — clone to a running
  app on `localhost` in ~5 minutes.
- **[Production setup](tutorials/production-setup.md)** — first deploy to
  Cloudflare Pages, D1, Turnstile, and the custom domain.

## How-to guides

Task-oriented recipes for things you'll do repeatedly.

- **[Manage challenges](how-to/manage-challenges.md)** — add, edit, and retire
  quiz challenges.
- **[Export and manage leads](how-to/export-and-manage-leads.md)** — pull lead
  data out of D1 for follow-up.
- **[Run migrations](how-to/run-migrations.md)** — apply schema and seed changes
  locally and in production.
- **[Deploy](how-to/deploy.md)** — routine deploys via CI, and manual deploys.
- **[Manage secrets](how-to/manage-secrets.md)** — set and rotate the Turnstile
  secret and Cloudflare API token.
- **[Update the embed](how-to/update-the-embed.md)** — change the Squarespace
  embed snippet.
- **[Monitor and debug](how-to/monitor-and-debug.md)** — tail live logs and test
  the OG image and share pages.

## Reference

Information-oriented, exhaustive facts.

- **[API](reference/api.md)** — every endpoint, request/response shape, status
  codes.
- **[Database schema](reference/database-schema.md)** — tables, columns,
  indexes, relationships.
- **[Configuration](reference/configuration.md)** — every environment variable,
  secret, and config file.
- **[npm scripts](reference/npm-scripts.md)** — what each `package.json` script
  does.
- **[Challenge system](reference/challenge-system.md)** — challenge types,
  scoring tiers, and the selection algorithm.

## Explanation

Understanding-oriented background.

- **[Architecture](explanation/architecture.md)** — the single-Pages-project
  design and request flow.
- **[Security](explanation/security.md)** — Turnstile, CORS, CSP, and the iframe
  sandbox.
- **[Privacy and data](explanation/privacy-and-data.md)** — what's collected,
  what isn't, and why.

## Operations

- **[Troubleshooting](troubleshooting.md)** — symptoms, causes, and fixes for
  common problems.
</content>
</invoke>
